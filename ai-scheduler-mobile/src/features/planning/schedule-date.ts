import { ENV } from '@/config';

export const toScheduleDateKey = (
  date = new Date(),
  timeZone = ENV.DEFAULT_TIMEZONE,
) => {
  const parts = new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).formatToParts(date);
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return `${value('year')}-${value('month')}-${value('day')}`;
};
