import { z } from 'zod';

const isoDateTime = z.iso.datetime({ offset: true });
const maxRangeMs = 31 * 24 * 60 * 60 * 1000;

export const calendarRangeSchema = z
  .object({
    timeMax: isoDateTime,
    timeMin: isoDateTime,
  })
  .superRefine(({ timeMax, timeMin }, context) => {
    const rangeMs = Date.parse(timeMax) - Date.parse(timeMin);

    if (rangeMs <= 0 || rangeMs > maxRangeMs) {
      context.addIssue({
        code: 'custom',
        message: 'Calendar range must be positive and no longer than 31 days',
        path: ['timeMax'],
      });
    }
  });

export type CalendarRange = z.infer<typeof calendarRangeSchema>;
