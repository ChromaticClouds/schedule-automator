import { strict as assert } from 'node:assert';
import {
  weeklyRescheduleOutputSchema,
  weeklyRescheduleRequestSchema,
} from '../dist/schemas/weekly-reschedule.js';
import {
  createDeterministicWeeklyRescheduleGenerator,
  remainingWeekDates,
} from '../dist/services/weekly-reschedule-contract.js';
import {
  validateWeeklyReschedule,
} from '../dist/services/weekly-reschedule-validation.js';

const taskId = '507f1f77bcf86cd799439011';
const context = {
  days: [{
    acceptsDraftChanges: true,
    blocked: [{
      end: '2026-07-04T10:00:00+09:00',
      start: '2026-07-04T09:00:00+09:00',
    }],
    date: '2026-07-04',
    maxDailyWorkMinutes: 120,
    scheduledTaskMinutes: 0,
  }],
  reviewDate: '2026-07-03',
  tasks: [{
    estimatedMinutes: 60,
    goalImpact: 4,
    id: taskId,
    importance: 5,
    postponedCount: 1,
    title: 'Reschedule me',
  }],
};
const output = {
  overflowTaskIds: [],
  placements: [{
    date: '2026-07-04',
    end: '2026-07-04T12:00:00+09:00',
    reason: 'Highest priority missed task',
    start: '2026-07-04T11:00:00+09:00',
    taskId,
    title: 'Reschedule me',
  }],
  summary: 'One task moved',
  warnings: [],
};

assert.deepEqual(remainingWeekDates('2026-07-03'), [
  '2026-07-04',
  '2026-07-05',
]);
assert.deepEqual(remainingWeekDates('2026-07-05'), []);
assert.equal(
  weeklyRescheduleRequestSchema.safeParse({
    reviewDate: '2026-02-31',
  }).success,
  false,
);
assert.deepEqual(weeklyRescheduleOutputSchema.parse(output), output);
assert.equal(
  weeklyRescheduleOutputSchema.safeParse({
    ...output,
    overflowTaskIds: [taskId],
  }).success,
  false,
);
assert.equal(validateWeeklyReschedule(output, context).ok, true);
assert.equal(
  validateWeeklyReschedule({
    ...output,
    placements: [{
      ...output.placements[0],
      end: '2026-07-04T10:00:00+09:00',
      start: '2026-07-04T09:00:00+09:00',
    }],
  }, context).reason,
  'blocked_time_collision',
);
assert.equal(
  validateWeeklyReschedule(output, {
    ...context,
    days: [{ ...context.days[0], acceptsDraftChanges: false }],
  }).reason,
  'invalid_schedule_date',
);
assert.equal(
  validateWeeklyReschedule({
    ...output,
    placements: [{
      ...output.placements[0],
      end: '2026-07-04T11:30:00+09:00',
    }],
  }, context).reason,
  'invalid_task_duration',
);
assert.equal(
  validateWeeklyReschedule(output, {
    ...context,
    days: [{ ...context.days[0], maxDailyWorkMinutes: 30 }],
  }).reason,
  'daily_work_limit_exceeded',
);
assert.equal(
  validateWeeklyReschedule({
    ...output,
    overflowTaskIds: [taskId],
    placements: [],
  }, context).ok,
  true,
);

const generator = createDeterministicWeeklyRescheduleGenerator(output);
const generated = await generator.generate(context);
generated.summary = 'mutated';
assert.equal((await generator.generate(context)).summary, output.summary);

console.log('weekly reschedule validation passed');
