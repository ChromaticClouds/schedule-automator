import { Types } from 'mongoose';
import { GoalModel, TaskModel } from '@/models/index.js';
import {
  hasOnlyAllowedParentTasks,
  taskBreakdownResponseSchema,
} from './task-breakdown.schema.js';
import { geminiTaskBreakdownGenerator } from '@/services/gemini-breakdown.js';
import type { TaskBreakdownContext, TaskBreakdownGenerator } from './breakdown-contract.js';
import {
  claimTaskBreakdown,
  markTaskBreakdownFailure,
} from './breakdown-idempotency.js';
import { persistTaskBreakdown } from './breakdown-persistence.js';
import { classifyGeminiError, type ExternalApiErrorDetails } from '@/services/external-api-error.js';
import { hashValue } from '@/services/breakdown-idempotency.js';

export class TaskBreakdownError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: ExternalApiErrorDetails,
  ) {
    super(message);
    this.name = 'TaskBreakdownError';
  }
}

const fail = (
  message: string,
  statusCode: number,
  code: string,
  details?: ExternalApiErrorDetails,
) => {
  throw new TaskBreakdownError(message, statusCode, code, details);
};

const serializeTasks = (tasks: InstanceType<typeof TaskModel>[]) =>
  tasks.map((task) => {
    const value = task.toObject() as Record<string, unknown>;
    delete value.generationIndex;
    delete value.generationKeyHash;
    return value;
  });

const recordFailure = async (
  logId: Parameters<typeof markTaskBreakdownFailure>[0],
  status: Parameters<typeof markTaskBreakdownFailure>[1],
) => {
  try {
    await markTaskBreakdownFailure(logId, status);
  } catch {
    return fail('AI request logging failed', 500, 'TASK_PERSISTENCE_ERROR');
  }
};

export const generateTaskBreakdown = async (
  userId: Types.ObjectId,
  goalId: Types.ObjectId,
  idempotencyKey: string,
  generator: TaskBreakdownGenerator = geminiTaskBreakdownGenerator,
) => {
  const goal = await GoalModel.findOne({
    _id: goalId,
    status: 'active',
    userId,
  }).lean();
  if (!goal) return fail('Goal not found', 404, 'GOAL_NOT_FOUND');

  const parentTasks = await TaskModel.find({
    generationKeyHash: { $exists: false },
    goalId,
    status: { $ne: 'archived' },
    userId,
  })
    .select({ _id: 1, title: 1 })
    .sort({ createdAt: 1, _id: 1 })
    .limit(50)
    .lean();
  const context: TaskBreakdownContext = {
    existingTasks: parentTasks.map((task) => ({
      id: task._id.toString(),
      title: task.title,
    })),
    goal: {
      description: goal.description ?? undefined,
      horizon: goal.horizon,
      importance: goal.importance,
      title: goal.title,
      weekEndDate: goal.weekEndDate ?? undefined,
      weekStartDate: goal.weekStartDate ?? undefined,
    },
  };
  const payloadHash = hashValue(JSON.stringify(context));
  const keyHash = hashValue(`${userId}:${goalId}:${idempotencyKey}`);
  const claim = await claimTaskBreakdown(userId, goalId, keyHash, payloadHash);
  if (claim.kind === 'conflict') {
    return fail('Idempotency key conflict', 409, 'IDEMPOTENCY_CONFLICT');
  }
  if (claim.kind === 'pending') {
    return fail('Task breakdown is in progress', 409, 'REQUEST_IN_PROGRESS');
  }
  if (claim.kind === 'replay') {
    return { replayed: true, tasks: serializeTasks(claim.tasks) };
  }

  let rawOutput: unknown;
  try {
    rawOutput = await generator.generate(context);
  } catch (error) {
    const details = classifyGeminiError(error);
    await recordFailure(claim.log._id, 'api_error');
    return fail('Gemini request failed', 502, details.code, details);
  }

  const parsed = taskBreakdownResponseSchema.safeParse(rawOutput);
  const allowedParents = new Set(context.existingTasks.map(({ id }) => id));
  if (
    !parsed.success ||
    !hasOnlyAllowedParentTasks(parsed.data, allowedParents)
  ) {
    await recordFailure(claim.log._id, 'schema_error');
    return fail('Gemini response was invalid', 422, 'AI_SCHEMA_ERROR');
  }

  try {
    const tasks = await persistTaskBreakdown(
      userId,
      goal,
      keyHash,
      claim.log._id,
      parsed.data,
    );
    return { replayed: false, tasks: serializeTasks(tasks) };
  } catch {
    try {
      await markTaskBreakdownFailure(claim.log._id, 'persistence_error');
    } catch {
      // The client still receives the original persistence failure category.
    }
    return fail('Task persistence failed', 500, 'TASK_PERSISTENCE_ERROR');
  }
};
