import { strict as assert } from 'node:assert';
import { scheduleDraftQuerySchema } from '../dist/schemas/schedule-draft.js';
import { canRejectScheduleDraft } from '../dist/services/schedule-lifecycle.js';

assert.deepEqual(scheduleDraftQuerySchema.parse({}), {});
assert.deepEqual(
  scheduleDraftQuerySchema.parse({ date: '2026-07-03' }),
  { date: '2026-07-03' },
);
assert.equal(
  scheduleDraftQuerySchema.safeParse({ date: '2026-02-31' }).success,
  false,
);
assert.equal(canRejectScheduleDraft('draft'), true);
assert.equal(canRejectScheduleDraft('rejected'), true);
assert.equal(canRejectScheduleDraft('approved'), false);
assert.equal(canRejectScheduleDraft('synced'), false);

console.log('schedule lifecycle validation passed');
