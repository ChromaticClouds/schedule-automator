import { z } from 'zod';
import { taskStatuses } from '@/models/constants.js';

const taskStatusSchema = z.enum(taskStatuses);
const defaultStatuses = taskStatuses.filter((status) => status !== 'archived');

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must use YYYY-MM-DD');

const statusesSchema = z.preprocess((value) => {
  if (Array.isArray(value)) return value.join(',').split(',');
  if (typeof value === 'string' && value.trim()) return value.split(',');
  return defaultStatuses;
}, z.array(taskStatusSchema).min(1));

export const taskSummaryQuerySchema = z
  .object({
    from: dateOnlySchema.optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    statuses: statusesSchema,
    to: dateOnlySchema.optional(),
  })
  .refine(
    (query) => !query.from || !query.to || query.from <= query.to,
    'from must be before or equal to to',
  );

const taskSummaryItemSchema = z.object({
  _id: z.string(),
  deadline: z.string().optional(),
  estimatedMinutes: z.number().int().positive(),
  status: taskStatusSchema,
  title: z.string().min(1),
});

const summaryBucketSchema = z.object({
  count: z.number().int().nonnegative(),
  estimatedMinutes: z.number().int().nonnegative(),
});

export const taskSummaryResponseSchema = z.object({
  byStatus: z.record(z.string(), summaryBucketSchema),
  range: z.object({
    from: dateOnlySchema.optional(),
    to: dateOnlySchema.optional(),
  }),
  statuses: z.array(taskStatusSchema),
  tasks: z.array(taskSummaryItemSchema),
  totals: summaryBucketSchema,
});

export type TaskSummaryQuery = z.infer<typeof taskSummaryQuerySchema>;
