import { strict as assert } from 'node:assert';
import { Types } from 'mongoose';
import {
  taskSummaryQuerySchema,
  taskSummaryResponseSchema,
} from '../dist/schemas/task-summary.js';
import {
  taskSummaryMatch,
  taskSummaryResponse,
} from '../dist/services/task-summary.js';

const query = taskSummaryQuerySchema.parse({
  from: '2026-07-04',
  limit: '10',
  statuses: 'todo,scheduled',
  to: '2026-07-05',
});

assert.deepEqual(query.statuses, ['todo', 'scheduled']);
assert.equal(query.limit, 10);
assert.deepEqual(
  taskSummaryQuerySchema.parse({ statuses: 'todo, scheduled,todo' }).statuses,
  ['todo', 'scheduled'],
);
assert.equal(
  taskSummaryQuerySchema.safeParse({ from: '2026-07-06', to: '2026-07-05' })
    .success,
  false,
);
assert.equal(
  taskSummaryQuerySchema.safeParse({ from: '2026-02-31' }).success,
  false,
);
assert.equal(
  taskSummaryQuerySchema.safeParse({ to: '2026-99-99' }).success,
  false,
);
assert.equal(
  taskSummaryQuerySchema.safeParse({ statuses: 'todo,unknown' }).success,
  false,
);

const response = taskSummaryResponseSchema.parse({
  byStatus: {
    scheduled: { count: 1, estimatedMinutes: 60 },
    todo: { count: 1, estimatedMinutes: 30 },
  },
  range: { from: '2026-07-04', to: '2026-07-05' },
  statuses: ['todo', 'scheduled'],
  tasks: [
    {
      _id: 'task-1',
      deadline: '2026-07-04T01:00:00.000Z',
      estimatedMinutes: 30,
      status: 'todo',
      title: 'Review plan',
    },
  ],
  totals: { count: 2, estimatedMinutes: 90 },
});

assert.equal(response.tasks[0].title, 'Review plan');

const userId = new Types.ObjectId('507f1f77bcf86cd799439011');
const match = taskSummaryMatch(userId, query, 'Asia/Seoul');
assert.equal(match.deadline.$gte.toISOString(), '2026-07-03T15:00:00.000Z');
assert.equal(match.deadline.$lt.toISOString(), '2026-07-05T15:00:00.000Z');

const aggregated = taskSummaryResponse(query, {
  buckets: [
    { _id: 'todo', count: 25, estimatedMinutes: 750 },
    { _id: 'scheduled', count: 3, estimatedMinutes: 180 },
  ],
  items: [
    {
      _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
      estimatedMinutes: 30,
      status: 'todo',
      title: 'First limited task',
    },
  ],
});
assert.equal(aggregated.tasks.length, 1);
assert.deepEqual(aggregated.totals, {
  count: 28,
  estimatedMinutes: 930,
});
assert.deepEqual(aggregated.byStatus.todo, {
  count: 25,
  estimatedMinutes: 750,
});

console.log('task summary validation passed');
