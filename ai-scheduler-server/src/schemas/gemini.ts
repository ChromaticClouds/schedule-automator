import { z } from 'zod';

const boundedText = (max: number) => z.string().trim().min(1).max(max);

const taskBreakdownItemSchema = z.object({
  checklist: z.array(boundedText(200)).max(12),
  estimatedMinutes: z.number().int().min(5).max(480),
  priorityReason: boundedText(500),
  title: boundedText(200),
});

export const taskBreakdownResponseSchema = z.object({
  assumptions: z.array(boundedText(500)).max(12),
  summary: boundedText(1000),
  taskBreakdown: z.array(taskBreakdownItemSchema).min(1).max(12),
});

export const idempotencyHeadersSchema = z.object({
  'idempotency-key': z.uuid(),
});

export type TaskBreakdownResponse = z.infer<
  typeof taskBreakdownResponseSchema
>;
