import { Types } from 'mongoose';
import { z } from 'zod';

const boundedText = (max: number) => z.string().trim().min(1).max(max);
const isRealDate = (value: string) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(isRealDate, 'Invalid schedule date');
const objectId = z.string().refine((value) => Types.ObjectId.isValid(value), {
  message: 'Invalid ObjectId',
});
const timeOnly = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const scheduleDraftRequestSchema = z.object({
  date: isoDate,
});

export const scheduleDraftQuerySchema = z.object({
  date: isoDate.optional(),
});

export const scheduleBlockEditParamsSchema = z.object({
  blockId: objectId,
  draftId: objectId,
});

export const scheduleBlockEditSchema = z
  .object({
    endTime: timeOnly,
    expectedUpdatedAt: z.string().datetime(),
    startTime: timeOnly,
    title: boundedText(160),
  })
  .strict();

export const scheduleBlockOutputSchema = z
  .object({
    end: z.string().datetime({ offset: true }),
    reason: boundedText(500).optional(),
    start: z.string().datetime({ offset: true }),
    taskId: objectId.optional(),
    title: boundedText(160),
    type: z.enum(['task', 'break']),
  })
  .strict();

export const scheduleDraftOutputSchema = z
  .object({
    assumptions: z.array(boundedText(500)).max(12).default([]),
    blocks: z.array(scheduleBlockOutputSchema).min(1).max(40),
    summary: boundedText(1000),
    warnings: z.array(boundedText(500)).max(12).default([]),
  })
  .strict();

export const scheduleIdempotencyKeySchema = z
  .string()
  .trim()
  .min(8)
  .max(128);

export type ScheduleBlockOutput = z.infer<typeof scheduleBlockOutputSchema>;
export type ScheduleBlockEdit = z.infer<typeof scheduleBlockEditSchema>;
export type ScheduleDraftOutput = z.infer<typeof scheduleDraftOutputSchema>;
