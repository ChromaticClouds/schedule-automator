import { Types } from 'mongoose';
import { z } from 'zod';

export const weeklyRescheduleRequestSchema = z.object({
  reviewDate: z.iso.date(),
});

export const weeklyRescheduleIdempotencyKeySchema = z
  .string()
  .trim()
  .min(8)
  .max(200);

const taskIdSchema = z
  .string()
  .refine((value) => Types.ObjectId.isValid(value), 'Invalid task id');

const placementSchema = z.object({
  date: z.iso.date(),
  end: z.iso.datetime({ offset: true }),
  reason: z.string().trim().min(1).max(500),
  start: z.iso.datetime({ offset: true }),
  taskId: taskIdSchema,
  title: z.string().trim().min(1).max(160),
});

export const weeklyRescheduleOutputSchema = z
  .object({
    overflowTaskIds: z.array(taskIdSchema).max(40),
    placements: z.array(placementSchema).max(40),
    summary: z.string().trim().min(1).max(1000),
    warnings: z.array(z.string().trim().min(1).max(500)).max(12).default([]),
  })
  .superRefine((value, context) => {
    const ids = [
      ...value.placements.map(({ taskId }) => taskId),
      ...value.overflowTaskIds,
    ];
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: 'custom',
        message: 'Each task must appear exactly once',
      });
    }
  });

export type WeeklyRescheduleOutput = z.infer<
  typeof weeklyRescheduleOutputSchema
>;
