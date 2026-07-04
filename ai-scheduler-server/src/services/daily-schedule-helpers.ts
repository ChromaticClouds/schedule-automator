import { createHash } from 'node:crypto';
import { ENV } from '@/config/env.js';

export const hashKey = (value: string) =>
  createHash('sha256').update(value).digest('hex');

export const redisKey = (...parts: string[]) =>
  `${ENV.REDIS_KEY_PREFIX}scheduler:daily:${parts.join(':')}`;

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
  return (Number(hour) * 60 + Number(minute) + wakeOffsetMinutes) % 1440;
};
