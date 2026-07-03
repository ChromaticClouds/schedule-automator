import { Types } from 'mongoose';
import { z } from 'zod';

export const objectIdParamSchema = z.object({
  id: z.string().refine((value) => Types.ObjectId.isValid(value), {
    message: 'Invalid ObjectId',
  }),
});

const optionalText = z.string().trim().min(1).optional();
const importance = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const createGoalSchema = z.object({
  title: z.string().trim().min(1),
  description: optionalText,
  horizon: z.enum(['weekly', 'monthly', 'long_term']).default('weekly'),
  importance,
  status: z
    .enum(['active', 'paused', 'completed', 'archived'])
    .default('active'),
  weekStartDate: optionalText,
  weekEndDate: optionalText,
});

export const updateGoalSchema = createGoalSchema.partial();

const checklistItemSchema = z.object({
  title: z.string().trim().min(1),
  done: z.boolean().default(false),
});

export const createTaskSchema = z.object({
  goalId: z
    .string()
    .refine((value) => Types.ObjectId.isValid(value), 'Invalid goalId')
    .optional(),
  title: z.string().trim().min(1),
  description: optionalText,
  checklist: z.array(checklistItemSchema).default([]),
  estimatedMinutes: z.number().int().positive(),
  deadline: z.coerce.date().optional(),
  importance,
  goalImpact: importance,
  postponedCount: z.number().int().nonnegative().default(0),
  energyLevel: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z
    .enum(['todo', 'scheduled', 'done', 'missed', 'overflow', 'archived'])
    .default('todo'),
});

export const updateTaskSchema = createTaskSchema.partial();

export const createProtectedTimeSchema = z.object({
  title: z.string().trim().min(1),
  category: z
    .enum(['sleep', 'meal', 'shower', 'leisure', 'exercise', 'custom'])
    .default('custom'),
  startTime: z.string().trim().min(1),
  endTime: z.string().trim().min(1),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).default([]),
  protectionLevel: z.enum(['hard', 'soft']).default('hard'),
});

export const updateProtectedTimeSchema = createProtectedTimeSchema.partial();
