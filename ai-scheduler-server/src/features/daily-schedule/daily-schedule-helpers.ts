import { createHash, randomUUID } from 'node:crypto';
import { ENV } from '@/core/config/env.js';
import type { KeyValueStore } from './daily-schedule-types.js';

export const hashKey = (value: string) =>
  createHash('sha256').update(value).digest('hex');

export const redisKey = (...parts: string[]) =>
  `${ENV.REDIS_KEY_PREFIX}scheduler:daily:${parts.join(':')}`;

const releaseLockScript = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0
`;

export const createLockToken = () => randomUUID();

export const releaseOwnedLock = (
  redis: KeyValueStore,
  key: string,
  token: string,
) => redis.eval(releaseLockScript, 1, key, token);

export const localParts = (date: Date, timezone: string) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: '2-digit',
    timeZone: timezone,
    year: 'numeric',
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return {
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    minuteOfDay: Number(parts.hour) * 60 + Number(parts.minute),
  };
};

export const wakeMinute = (wakeTime: string, wakeOffsetMinutes: number) => {
  const [hour = '0', minute = '0'] = wakeTime.split(':');
  return Number(hour) * 60 + Number(minute) + wakeOffsetMinutes;
};

const addDateDays = (dateKey: string, days: number) => {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const dueScheduleDate = (
  dateKey: string,
  minuteOfDay: number,
  wakeTime: string,
  wakeOffsetMinutes: number,
) => {
  const wake = wakeMinute(wakeTime, 0);
  const target = wake + wakeOffsetMinutes;
  if (target < 1440) return minuteOfDay >= target ? dateKey : null;

  const wrappedTarget = target - 1440;
  const previousScheduleIsDue =
    minuteOfDay >= wrappedTarget && minuteOfDay < wake;
  return previousScheduleIsDue ? addDateDays(dateKey, -1) : null;
};
