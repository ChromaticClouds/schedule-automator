import { strict as assert } from 'node:assert';
import {
  createHarness,
  FakeRedis,
  user,
} from './daily-schedule-worker-fixtures.mjs';

const { ENV } = await import('../dist/core/config/env.js');
const { dueScheduleDate } = await import(
  '../dist/features/daily-schedule/daily-schedule-helpers.js'
);
const { runDailyScheduleLoop } = await import(
  '../dist/features/daily-schedule/daily-schedule-loop.js'
);
const { runDailyScheduleTick } = await import(
  '../dist/features/daily-schedule/daily-schedule-service.js'
);

assert.equal(ENV.DAILY_PLAN_JOB_ENABLED, false);
assert.equal(dueScheduleDate('2026-07-04', 429, '07:00', 10), null);
assert.equal(
  dueScheduleDate('2026-07-04', 430, '07:00', 10),
  '2026-07-04',
);
assert.equal(dueScheduleDate('2026-07-04', 1410, '23:00', 120), null);
assert.equal(dueScheduleDate('2026-07-05', 59, '23:00', 120), null);
assert.equal(
  dueScheduleDate('2026-07-05', 60, '23:00', 120),
  '2026-07-04',
);
assert.equal(
  dueScheduleDate('2026-07-05', 720, '23:00', 120),
  '2026-07-04',
);

const harness = createHarness();
const redis = new FakeRedis();
const now = new Date('2026-07-04T07:10:00.000Z');
const first = await runDailyScheduleTick(redis, now, harness.store);
const firstDraft = harness.getGeneratedDraft();

assert.deepEqual(first, {
  createdSchedules: 1,
  dueUsers: 1,
  failedUsers: 0,
  scannedUsers: 1,
  skippedUsers: 0,
});
assert.equal(firstDraft.date, '2026-07-04');
assert.equal(firstDraft.userId, 'user-1');
assert.equal(
  await redis.get('test:scheduler:daily:user-1:2026-07-04:done'),
  '1',
);

harness.resetGeneratedDraft();
const second = await runDailyScheduleTick(redis, now, harness.store);
assert.equal(second.createdSchedules, 0);
assert.equal(second.skippedUsers, 1);
assert.equal(harness.getGeneratedDraft(), null);

const lockRedis = new FakeRedis();
const lockHarness = createHarness();
const lockKey = 'test:scheduler:daily:user-1:2026-07-04:lock';
const lockStore = {
  ...lockHarness.store,
  async createDailySchedule(...args) {
    await lockRedis.set(lockKey, 'new-owner');
    return lockHarness.store.createDailySchedule(...args);
  },
};
await runDailyScheduleTick(lockRedis, now, lockStore);
assert.equal(await lockRedis.get(lockKey), 'new-owner');
const failingRedis = new FakeRedis();
let failedIdempotencyKey = null;
const failingStore = {
  ...harness.store,
  async createDailySchedule(_userId, _date, idempotencyKey) {
    failedIdempotencyKey = idempotencyKey;
    throw new Error('database unavailable');
  },
};
const failed = await runDailyScheduleTick(failingRedis, now, failingStore);
assert.equal(failed.failedUsers, 1);

harness.resetGeneratedDraft();
const recovered = await runDailyScheduleTick(
  failingRedis,
  new Date('2026-07-04T07:16:00.000Z'),
  harness.store,
);
assert.equal(recovered.createdSchedules, 1);
assert.notEqual(
  harness.getGeneratedDraft().idempotencyKey,
  failedIdempotencyKey,
);

const midnightHarness = createHarness();
const midnightStore = {
  ...midnightHarness.store,
  async listUsers() {
    return [{ ...user, wakeOffsetMinutes: 120, wakeTime: '23:00' }];
  },
};
const early = await runDailyScheduleTick(
  new FakeRedis(),
  new Date('2026-07-04T23:30:00.000Z'),
  midnightStore,
);
assert.equal(early.dueUsers, 0);

const midnight = await runDailyScheduleTick(
  new FakeRedis(),
  new Date('2026-07-05T01:00:00.000Z'),
  midnightStore,
);
assert.equal(midnight.createdSchedules, 1);
assert.equal(midnightHarness.getGeneratedDraft().date, '2026-07-04');

const badTimezone = await runDailyScheduleTick(redis, now, {
  ...harness.store,
  async listUsers() {
    return [{ ...user, timezone: 'Mars/Olympus' }];
  },
});
assert.equal(badTimezone.failedUsers, 1);

let tickCount = 0;
let loggedErrors = 0;
let loggedStats = 0;
await runDailyScheduleLoop(new FakeRedis(), {
  logError: () => {
    loggedErrors += 1;
  },
  logStats: () => {
    loggedStats += 1;
  },
  shouldStop: () => tickCount >= 2,
  tick: async () => {
    tickCount += 1;
    if (tickCount === 1) throw new Error('transient outage');
    return first;
  },
  wait: async () => undefined,
});
assert.equal(loggedErrors, 1);
assert.equal(loggedStats, 1);

console.log('daily schedule worker validation passed');
