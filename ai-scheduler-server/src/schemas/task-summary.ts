import { z } from 'zod';
import { taskStatuses } from '@/models/constants.js';

const taskStatusSchema = z.enum(taskStatuses);
const defaultStatuses = taskStatuses.filter((status) => status !== 'archived');

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must use YYYY-MM-DD')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value;
  }, 'date must be a real calendar date');

const statusesSchema = z.preprocess((value) => {
  const values = Array.isArray(value) ? value.join(',') : value;
  if (typeof values === 'string' && values.trim()) {
    return [...new Set(values.split(',').map((status) => status.trim()))];
  }
  return defaultStatuses;
}, z.array(taskStatusSchema).min(1).max(taskStatuses.length));

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
