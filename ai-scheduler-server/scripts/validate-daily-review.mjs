import { strict as assert } from 'node:assert';
import {
  dailyReviewParamsSchema,
  saveDailyReviewSchema,
} from '../dist/schemas/daily-review.js';
import { buildTaskReviewUpdates } from '../dist/services/daily-review-transition.js';

const first = '507f1f77bcf86cd799439011';
const second = '507f1f77bcf86cd799439012';

assert.equal(
  dailyReviewParamsSchema.safeParse({ date: '2026-07-04' }).success,
  true,
);
assert.equal(
  dailyReviewParamsSchema.safeParse({ date: '2026-02-31' }).success,
  false,
);
assert.equal(
  saveDailyReviewSchema.safeParse({
    completedTaskIds: [first],
    missedTaskIds: [first],
  }).success,
  false,
);
assert.equal(
  saveDailyReviewSchema.safeParse({
    completedTaskIds: [first, first],
    missedTaskIds: [],
  }).success,
  false,
);
assert.equal(
  saveDailyReviewSchema.safeParse({
    completedTaskIds: ['not-an-object-id'],
    missedTaskIds: [],
  }).success,
  false,
);

assert.deepEqual(
  buildTaskReviewUpdates(
    { completedTaskIds: [], missedTaskIds: [] },
    { completedTaskIds: [first], missedTaskIds: [second] },
  ),
  [
    { postponedDelta: 0, status: 'done', taskId: first },
    { postponedDelta: 1, status: 'missed', taskId: second },
  ],
);
assert.deepEqual(
  buildTaskReviewUpdates(
    { completedTaskIds: [first], missedTaskIds: [second] },
    { completedTaskIds: [first], missedTaskIds: [second] },
  ),
  [
    { postponedDelta: 0, status: 'done', taskId: first },
    { postponedDelta: 0, status: 'missed', taskId: second },
  ],
);
assert.deepEqual(
  buildTaskReviewUpdates(
    { completedTaskIds: [first], missedTaskIds: [second] },
    { completedTaskIds: [second], missedTaskIds: [first] },
  ),
  [
    { postponedDelta: 1, status: 'missed', taskId: first },
    { postponedDelta: -1, status: 'done', taskId: second },
  ],
);

console.log('daily review validation passed');
