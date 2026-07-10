import { strict as assert } from 'node:assert';
import {
  scheduleDraftOutputSchema,
  scheduleDraftRequestSchema,
  scheduleIdempotencyKeySchema,
} from '../dist/features/schedule-drafts/schedule-draft.schema.js';
import { ScheduleDraftModel } from '../dist/models/index.js';
import { createDeterministicCalendarEventWriter } from '../dist/features/calendar/calendar-writer.js';
import { zonedDayRange } from '../dist/shared/time/schedule-time.js';
import { validateScheduleDraft } from '../dist/features/schedule-drafts/schedule-validation.js';

const taskId = '507f1f77bcf86cd799439011';
const context = {
  busy: [
    {
      end: '2026-07-03T10:30:00.000Z',
      source: 'calendar',
      start: '2026-07-03T10:00:00.000Z',
      title: 'meeting',
    },
  ],
  date: '2026-07-03',
  maxDailyWorkMinutes: 60,
  protected: [
    {
      end: '2026-07-03T12:30:00.000Z',
      start: '2026-07-03T12:00:00.000Z',
      title: 'lunch',
    },
  ],
  tasks: [
    {
      estimatedMinutes: 45,
      id: taskId,
      importance: 4,
      title: 'Implement schedule draft',
    },
  ],
  timezone: 'UTC',
};
const output = {
  assumptions: [],
  blocks: [
    {
      end: '2026-07-03T09:45:00.000Z',
      reason: 'Highest impact task',
      start: '2026-07-03T09:00:00.000Z',
      taskId,
      title: 'Implement schedule draft',
      type: 'task',
    },
  ],
  summary: 'One focused block',
  warnings: [],
};

assert.deepEqual(scheduleDraftOutputSchema.parse(output), output);
assert.equal(
  scheduleDraftRequestSchema.parse({ date: '2026-07-03' }).date,
  '2026-07-03',
);
assert.equal(
  scheduleDraftRequestSchema.parse({
    date: '2026-07-03',
    instruction: 'Keep the morning open for focused work.',
  }).instruction,
  'Keep the morning open for focused work.',
);
assert.equal(
  scheduleDraftRequestSchema.safeParse({ date: '2026-07-03', instruction: '' }).success,
  false,
);
assert.equal(
  scheduleDraftRequestSchema.safeParse({ date: '2026-02-31' }).success,
  false,
);
assert.equal(
  scheduleDraftRequestSchema.safeParse({ date: '2026-13-01' }).success,
  false,
);
assert.equal(scheduleIdempotencyKeySchema.safeParse('daily:request').success, true);
assert.deepEqual(zonedDayRange('2026-07-03', 'Asia/Seoul'), {
  timeMax: '2026-07-03T23:59:59.999+09:00',
  timeMin: '2026-07-03T00:00:00.000+09:00',
});
assert.deepEqual(validateScheduleDraft(output, context), {
  blocks: output.blocks,
  ok: true,
});
assert.equal(
  validateScheduleDraft({
    ...output,
    blocks: [{
      ...output.blocks[0],
      end: '2026-07-03T10:45:00.000Z',
      start: '2026-07-03T10:15:00.000Z',
    }],
  }, context).reason,
  'blocked_time_collision',
);
assert.equal(
  validateScheduleDraft({
    ...output,
    blocks: [{ ...output.blocks[0], taskId: '507f1f77bcf86cd799439012' }],
  }, context).reason,
  'invalid_task_reference',
);
assert.equal(
  validateScheduleDraft({
    ...output,
    blocks: [{
      ...output.blocks[0],
      end: '2026-07-03T08:15:00.000Z',
      start: '2026-07-03T07:00:00.000Z',
    }],
  }, { ...context, maxDailyWorkMinutes: 30 }).reason,
  'daily_work_limit_exceeded',
);
assert.equal(
  validateScheduleDraft({
    ...output,
    blocks: [{
      ...output.blocks[0],
      end: '2026-07-03T23:30:00+09:00',
      start: '2026-07-03T23:00:00+09:00',
    }],
  }, {
    ...context,
    busy: [],
    protected: [{
      end: '2026-07-04T06:00:00+09:00',
      start: '2026-07-03T22:00:00+09:00',
      title: 'sleep',
    }],
  }).reason,
  'blocked_time_collision',
);
const fake = { generate: async () => structuredClone(output) };
const generated = await fake.generate(context);
generated.blocks[0].title = 'mutated';
assert.equal((await fake.generate(context)).blocks[0].title, output.blocks[0].title);
const uniqueActiveDraftIndex = ScheduleDraftModel.schema.indexes().some(
  ([keys, options]) =>
    options.unique === true &&
    Object.hasOwn(keys, 'userId') &&
    Object.hasOwn(keys, 'date'),
);
assert.equal(uniqueActiveDraftIndex, true);

const { writer, writes } = createDeterministicCalendarEventWriter();
assert.equal((await writer.createEvent('calendar-1', {
  end: new Date('2026-07-03T09:45:00.000Z'),
  start: new Date('2026-07-03T09:00:00.000Z'),
  title: 'Implement schedule draft',
})).eventId, 'event-1');
assert.deepEqual(writes, [{
  calendarId: 'calendar-1',
  title: 'Implement schedule draft',
}]);
console.log('schedule draft validation passed');
