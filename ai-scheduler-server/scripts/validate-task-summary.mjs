import { strict as assert } from 'node:assert';
import {
  taskSummaryQuerySchema,
  taskSummaryResponseSchema,
} from '../dist/schemas/task-summary.js';

const query = taskSummaryQuerySchema.parse({
  from: '2026-07-04',
  limit: '10',
  statuses: 'todo,scheduled',
  to: '2026-07-05',
});

assert.deepEqual(query.statuses, ['todo', 'scheduled']);
assert.equal(query.limit, 10);
assert.equal(
  taskSummaryQuerySchema.safeParse({ from: '2026-07-06', to: '2026-07-05' })
    .success,
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

console.log('task summary validation passed');
