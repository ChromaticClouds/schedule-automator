import { z } from 'zod';

const wakeTimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'wakeTime must use HH:mm');

const timezoneSchema = z.string().trim().min(1).refine((timezone) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}, 'Unsupported IANA timezone');

export const schedulePreferencesSchema = z.object({
  maxDailyWorkMinutes: z.number().int().min(60).max(720),
  timezone: timezoneSchema,
  wakeOffsetMinutes: z.number().int().min(0).max(240),
  wakeTime: wakeTimeSchema,
});

export const updateSchedulePreferencesSchema = schedulePreferencesSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one preference is required',
  });

export type SchedulePreferences = z.infer<typeof schedulePreferencesSchema>;
