import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i);

export const taskBreakdownParamsSchema = z.object({
  goalId: objectId,
});

export const idempotencyKeySchema = z
  .string()
  .min(8)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/);

export const taskBreakdownItemSchema = z
  .object({
    checklist: z.array(z.string().trim().min(1).max(160)).min(1).max(12),
    estimatedMinutes: z.number().int().min(5).max(480),
    parentTaskId: objectId.optional(),
    priorityReason: z.string().trim().min(1).max(500),
    title: z.string().trim().min(1).max(160),
  })
  .strict();

export const taskBreakdownResponseSchema = z
  .object({
    taskBreakdown: z.array(taskBreakdownItemSchema).min(1).max(20),
  })
  .strict()
  .superRefine(({ taskBreakdown }, context) => {
    const total = taskBreakdown.reduce(
      (sum, task) => sum + task.estimatedMinutes,
      0,
    );
    if (total > 2400) {
      context.addIssue({
        code: 'custom',
        message: 'Total estimated time exceeds the weekly generation limit',
        path: ['taskBreakdown'],
      });
    }
  });

export type TaskBreakdownResponse = z.infer<
  typeof taskBreakdownResponseSchema
>;

export const hasOnlyAllowedParentTasks = (
  output: TaskBreakdownResponse,
  allowedParentIds: Set<string>,
) =>
  output.taskBreakdown.every(
    ({ parentTaskId }) =>
      !parentTaskId || allowedParentIds.has(parentTaskId),
  );
