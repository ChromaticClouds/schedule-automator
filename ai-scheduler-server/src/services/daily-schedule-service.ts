import { ENV } from '@/config/env.js';
import {
  hashKey,
  localParts,
  redisKey,
  wakeMinute,
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
  retryKey: string,
  now: Date,
) => {
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
  const idempotency = hashKey(`daily-schedule:${user._id}:${dateKey}`);
  const doneKey = redisKey(user._id, dateKey, 'done');
  const lockKey = redisKey(user._id, dateKey, 'lock');
  const retryKey = redisKey(user._id, dateKey, 'retry');
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
    await redis.del(retryKey);
    await redis.set(doneKey, '1', 'EX', 172800);
    return !result.replayed;
  } catch {
    await deferRetry(redis, retryKey, now);
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
    const { dateKey, minuteOfDay } = localParts(now, user.timezone);
    if (minuteOfDay < wakeMinute(user.wakeTime, user.wakeOffsetMinutes)) {
      stats.skippedUsers += 1;
      continue;
    }

    stats.dueUsers += 1;
    try {
      const created = await scheduleUser(redis, store, user, dateKey, now);
      stats.createdSchedules += created ? 1 : 0;
      stats.skippedUsers += created ? 0 : 1;
    } catch {
      stats.failedUsers += 1;
    }
  }

  return stats;
};
