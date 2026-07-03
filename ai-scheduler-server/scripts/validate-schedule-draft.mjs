import { strict as assert } from 'node:assert';
import {
  scheduleDraftOutputSchema,
  scheduleDraftRequestSchema,
  scheduleIdempotencyKeySchema,
} from '../dist/schemas/schedule-draft.js';
import { createDeterministicScheduleGenerator } from '../dist/services/schedule-contract.js';
import { validateScheduleDraft } from '../dist/services/schedule-validation.js';

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
assert.equal(scheduleDraftRequestSchema.parse({ date: '2026-07-03' }).date, '2026-07-03');
assert.equal(scheduleIdempotencyKeySchema.safeParse('daily:request').success, true);
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
const fake = createDeterministicScheduleGenerator(output);
const generated = await fake.generate(context);
generated.blocks[0].title = 'mutated';
assert.equal((await fake.generate(context)).blocks[0].title, output.blocks[0].title);

console.log('schedule draft validation passed');
