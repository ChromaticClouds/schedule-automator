import { ENV } from '@/config/env.js';
import {
  dueScheduleDate,
  hashKey,
  localParts,
  redisKey,
} from './daily-schedule-helpers.js';
import { mongoDailyScheduleStore } from './daily-schedule-store.js';
import type {
  DailyScheduleStats,
  DailyScheduleStore,
  KeyValueStore,
  SchedulerUser,
} from './daily-schedule-types.js';

const initialStats = (): DailyScheduleStats => ({
  createdSchedules: 0,
  dueUsers: 0,
  failedUsers: 0,
  scannedUsers: 0,
  skippedUsers: 0,
});

const deferRetry = async (
  redis: KeyValueStore,
  attemptKey: string,
  retryKey: string,
  now: Date,
) => {
  const nextAttempt = Number(await redis.get(attemptKey)) + 1;
  await redis.set(attemptKey, String(nextAttempt), 'EX', 172800);
  await redis.set(
    retryKey,
    String(now.getTime() + ENV.DAILY_SCHEDULE_RETRY_DELAY_MS),
    'PX',
    ENV.DAILY_SCHEDULE_RETRY_DELAY_MS,
  );
};

const scheduleUser = async (
  redis: KeyValueStore,
  store: DailyScheduleStore,
  user: SchedulerUser,
  dateKey: string,
  now: Date,
) => {
  const attemptKey = redisKey(user._id, dateKey, 'attempt');
  const doneKey = redisKey(user._id, dateKey, 'done');
  const lockKey = redisKey(user._id, dateKey, 'lock');
  const retryKey = redisKey(user._id, dateKey, 'retry');
  const attempt = Number(await redis.get(attemptKey)) || 0;
  const idempotency = hashKey(
    `daily-schedule:${user._id}:${dateKey}:${attempt}`,
  );
  const retryAfter = Number(await redis.get(retryKey));

  if ((await redis.get(doneKey)) || retryAfter > now.getTime()) return false;

  const lock = await redis.set(
    lockKey,
    '1',
    'EX',
    ENV.DAILY_SCHEDULE_LOCK_TTL_SECONDS,
    'NX',
  );
  if (lock !== 'OK') return false;

  try {
    if (!(await store.hasGoogleConnection(user._id))) return false;

    const tasks = await store.listCandidateTasks(user._id);
    if (tasks.length === 0) return false;

    const result = await store.createDailySchedule(user._id, dateKey, idempotency);
    await redis.del(attemptKey);
    await redis.del(retryKey);
    await redis.set(doneKey, '1', 'EX', 172800);
    return !result.replayed;
  } catch {
    await deferRetry(redis, attemptKey, retryKey, now);
    throw new Error('daily schedule generation failed');
  } finally {
    await redis.del(lockKey);
  }
};

export const runDailyScheduleTick = async (
  redis: KeyValueStore,
  now = new Date(),
  store = mongoDailyScheduleStore,
): Promise<DailyScheduleStats> => {
  const stats = initialStats();
  const users = await store.listUsers();
  stats.scannedUsers = users.length;

  for (const user of users) {
    let dateKey: string;
    let minuteOfDay: number;
    try {
      ({ dateKey, minuteOfDay } = localParts(now, user.timezone));
    } catch {
      stats.failedUsers += 1;
      continue;
    }

    const scheduleDate = dueScheduleDate(
      dateKey,
      minuteOfDay,
      user.wakeTime,
      user.wakeOffsetMinutes,
    );
    if (!scheduleDate) {
      stats.skippedUsers += 1;
      continue;
    }

    stats.dueUsers += 1;
    try {
      const created = await scheduleUser(redis, store, user, scheduleDate, now);
      stats.createdSchedules += created ? 1 : 0;
      stats.skippedUsers += created ? 0 : 1;
    } catch {
      stats.failedUsers += 1;
    }
  }

  return stats;
};
