import { strict as assert } from 'node:assert';
import {
  hasOnlyAllowedParentTasks,
  idempotencyKeySchema,
  taskBreakdownResponseSchema,
} from '../dist/schemas/task-breakdown.js';
import {
  AiRequestLogModel,
  TaskModel,
} from '../dist/models/index.js';
import { createDeterministicTaskBreakdownGenerator } from '../dist/services/breakdown-contract.js';
import { hashValue } from '../dist/services/breakdown-idempotency.js';

const valid = {
  taskBreakdown: [
    {
      checklist: ['Open the project', 'Implement the change'],
      estimatedMinutes: 90,
      priorityReason: 'Unblocks the weekly goal',
      title: 'Implement the first milestone',
    },
  ],
};

assert.deepEqual(taskBreakdownResponseSchema.parse(valid), valid);
assert.equal(
  taskBreakdownResponseSchema.safeParse({
    taskBreakdown: [{ ...valid.taskBreakdown[0], title: ' ' }],
  }).success,
  false,
);
assert.equal(
  taskBreakdownResponseSchema.safeParse({
    taskBreakdown: [{ ...valid.taskBreakdown[0], estimatedMinutes: 481 }],
  }).success,
  false,
);
assert.equal(
  taskBreakdownResponseSchema.safeParse({
    taskBreakdown: [{ ...valid.taskBreakdown[0], unexpected: true }],
  }).success,
  false,
);
assert.equal(idempotencyKeySchema.safeParse('request:12345678').success, true);
assert.equal(idempotencyKeySchema.safeParse('short').success, false);
const parentId = '507f1f77bcf86cd799439011';
const withParent = taskBreakdownResponseSchema.parse({
  taskBreakdown: [{ ...valid.taskBreakdown[0], parentTaskId: parentId }],
});
assert.equal(
  hasOnlyAllowedParentTasks(withParent, new Set([parentId])),
  true,
);
assert.equal(hasOnlyAllowedParentTasks(withParent, new Set()), false);
assert.equal(hashValue('same payload'), hashValue('same payload'));
assert.notEqual(hashValue('same payload'), hashValue('other payload'));

const hasUniqueIndex = (model, fields) =>
  model.schema.indexes().some(
    ([keys, options]) =>
      options.unique === true &&
      fields.every((field) => Object.hasOwn(keys, field)),
  );
assert.equal(
  hasUniqueIndex(TaskModel, [
    'userId',
    'generationKeyHash',
    'generationIndex',
  ]),
  true,
);
assert.equal(
  hasUniqueIndex(AiRequestLogModel, [
    'userId',
    'type',
    'idempotencyKeyHash',
  ]),
  true,
);

const fake = createDeterministicTaskBreakdownGenerator(valid);
const first = await fake.generate({ existingTasks: [], goal: {} });
first.taskBreakdown[0].title = 'mutated';
const second = await fake.generate({ existingTasks: [], goal: {} });
assert.equal(second.taskBreakdown[0].title, valid.taskBreakdown[0].title);

console.log('task breakdown validation passed');
