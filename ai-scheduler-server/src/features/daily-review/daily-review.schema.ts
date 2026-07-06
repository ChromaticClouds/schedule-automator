import { Types } from 'mongoose';
import { z } from 'zod';

const dateSchema = z.iso.date();
const taskIdSchema = z
  .string()
  .refine((value) => Types.ObjectId.isValid(value), 'Invalid task id');

export const dailyReviewQuerySchema = z.object({
  date: dateSchema,
});

export const saveDailyReviewSchema = z
  .object({
    completedTaskIds: z.array(taskIdSchema).max(100),
    missedTaskIds: z.array(taskIdSchema).max(100),
    notes: z.string().trim().max(2000).optional(),
  })
  .superRefine((value, context) => {
    const completed = new Set(value.completedTaskIds);
    const all = [...value.completedTaskIds, ...value.missedTaskIds];
    if (new Set(all).size !== all.length) {
      context.addIssue({
        code: 'custom',
        message: 'Task ids must be unique and cannot overlap',
      });
    }
    if (value.missedTaskIds.some((id) => completed.has(id))) {
      context.addIssue({
        code: 'custom',
        message: 'A task cannot be both completed and missed',
      });
    }
  });

export const dailyReviewParamsSchema = z.object({
  date: dateSchema,
});

export type SaveDailyReviewInput = z.infer<typeof saveDailyReviewSchema>;
