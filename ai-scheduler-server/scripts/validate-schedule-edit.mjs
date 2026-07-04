import { strict as assert } from 'node:assert';
import { scheduleBlockEditSchema } from '../dist/schemas/schedule-draft.js';
import { scheduleEditOutput } from '../dist/services/schedule-edit.js';
import { scheduleEditGuard } from '../dist/services/schedule-edit-state.js';
import { validateScheduleDraft } from '../dist/services/schedule-validation.js';

const id = (value) => ({ toString: () => value });
const draftId = '507f1f77bcf86cd799439010';
const blockId = '507f1f77bcf86cd799439011';
const updatedAt = new Date('2026-07-04T00:00:00.000Z');
const edit = scheduleBlockEditSchema.parse({
  endTime: '10:00',
  expectedUpdatedAt: updatedAt.toISOString(),
  startTime: '09:00',
  title: 'Edited focus block',
});
const draft = {
  assumptions: [],
  blocks: [{
    _id: id(blockId),
    end: new Date('2026-07-04T01:00:00.000Z'),
    source: 'ai',
    start: new Date('2026-07-04T00:00:00.000Z'),
    taskId: id('507f1f77bcf86cd799439012'),
    title: 'Original focus block',
    type: 'task',
  }],
  date: '2026-07-04',
  status: 'draft',
  summary: 'Daily plan',
  updatedAt,
  userId: id(draftId),
  warnings: [],
};

assert.equal(
  scheduleEditGuard(draft, draftId, blockId, updatedAt.toISOString()),
  undefined,
);
assert.equal(
  scheduleEditGuard(draft, '507f1f77bcf86cd799439099', blockId, updatedAt.toISOString()).code,
  'DRAFT_NOT_FOUND',
);
assert.equal(
  scheduleEditGuard({ ...draft, status: 'approved' }, draftId, blockId, updatedAt.toISOString()).code,
  'INVALID_DRAFT_STATE',
);
assert.equal(
  scheduleEditGuard(draft, draftId, blockId, '2026-07-04T00:01:00.000Z').code,
  'STALE_DRAFT_VERSION',
);
assert.equal(
  scheduleEditGuard(draft, draftId, '507f1f77bcf86cd799439098', updatedAt.toISOString()).code,
  'DRAFT_BLOCK_NOT_FOUND',
);

const output = scheduleEditOutput(draft, blockId, edit, 'Asia/Seoul');
assert.equal(output.blocks[0].title, 'Edited focus block');
assert.equal(output.blocks[0].start, '2026-07-04T09:00:00.000+09:00');
assert.equal(output.blocks[0].taskId, '507f1f77bcf86cd799439012');
const context = {
  busy: [],
  date: '2026-07-04',
  maxDailyWorkMinutes: 120,
  protected: [],
  tasks: [{
    estimatedMinutes: 60,
    id: '507f1f77bcf86cd799439012',
    importance: 3,
    title: 'Original focus block',
  }],
  timezone: 'Asia/Seoul',
};
assert.equal(validateScheduleDraft(output, context).ok, true);
assert.equal(
  validateScheduleDraft({
    ...output,
    blocks: [{
      ...output.blocks[0],
      end: '2026-07-04T00:30:00.000Z',
      start: '2026-07-03T23:30:00.000Z',
    }],
  }, context).ok,
  true,
);
assert.equal(
  validateScheduleDraft(output, {
    ...context,
    busy: [{
      end: '2026-07-04T09:45:00.000+09:00',
      source: 'calendar',
      start: '2026-07-04T09:30:00.000+09:00',
      title: 'Meeting',
    }],
  }).reason,
  'blocked_time_collision',
);
assert.equal(
  scheduleBlockEditSchema.safeParse({ ...edit, startTime: '25:00' }).success,
  false,
);

console.log('schedule edit validation passed');
