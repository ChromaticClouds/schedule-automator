import { Types } from 'mongoose';
import { AiRequestLogModel } from '@/models/index.js';
import { weeklyRescheduleOutputSchema } from './weekly-reschedule.schema.js';
import { hashValue } from '@/services/breakdown-idempotency.js';
import {
  classifyGeminiError,
  type ExternalApiErrorDetails,
} from '@/services/external-api-error.js';
import { geminiWeeklyRescheduleGenerator } from '@/integrations/gemini/gemini-weekly-reschedule.js';
import type { WeeklyRescheduleGenerator } from './weekly-reschedule-contract.js';
import { buildWeeklyRescheduleContext } from './weekly-reschedule-context.js';
import { claimWeeklyReschedule } from './weekly-reschedule-idempotency.js';
import { persistWeeklyReschedule } from './weekly-reschedule-persistence.js';
import { validateWeeklyReschedule } from './weekly-reschedule-validation.js';

export class WeeklyRescheduleError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: ExternalApiErrorDetails,
  ) {
    super(message);
    this.name = 'WeeklyRescheduleError';
  }
}

const fail = (
  message: string,
  statusCode: number,
  code: string,
  details?: ExternalApiErrorDetails,
): never => {
  throw new WeeklyRescheduleError(message, statusCode, code, details);
};

const markLog = (
  logId: Types.ObjectId,
  responseStatus: 'schema_error' | 'api_error' | 'persistence_error',
) => AiRequestLogModel.updateOne(
  { _id: logId },
  { $set: { errorMessage: responseStatus, responseStatus } },
);

export const rescheduleMissedTasks = async (
  userId: Types.ObjectId,
  reviewDate: string,
  idempotencyKey: string,
  generator: WeeklyRescheduleGenerator = geminiWeeklyRescheduleGenerator,
) => {
  const context = await buildWeeklyRescheduleContext(userId, reviewDate);
  const payloadHash = hashValue(JSON.stringify(context));
  const keyHash = hashValue(`${userId}:${reviewDate}:${idempotencyKey}`);
  const claim = await claimWeeklyReschedule(userId, keyHash, payloadHash);
  if (claim.kind === 'conflict') {
    return fail('Idempotency key conflict', 409, 'IDEMPOTENCY_CONFLICT');
  }
  if (claim.kind === 'pending') {
    return fail('Weekly reschedule is in progress', 409, 'REQUEST_IN_PROGRESS');
  }
  if (claim.kind === 'replayed') {
    return { drafts: [], overflowTaskIds: [], placedTaskIds: [], replayed: true };
  }

  let rawOutput: unknown;
  try {
    rawOutput = context.tasks.length === 0
      ? { overflowTaskIds: [], placements: [], summary: 'No missed tasks', warnings: [] }
      : await generator.generate(context);
  } catch (error) {
    const details = classifyGeminiError(error);
    await markLog(claim.log._id, 'api_error');
    return fail('Schedule provider failed', 502, details.code, details);
  }
  const parsed = weeklyRescheduleOutputSchema.safeParse(rawOutput);
  if (!parsed.success) {
    await markLog(claim.log._id, 'schema_error');
    return fail('Replan response was invalid', 422, 'REPLAN_SCHEMA_ERROR');
  }
  const valid = validateWeeklyReschedule(parsed.data, context);
  if (!valid.ok) {
    await markLog(claim.log._id, 'schema_error');
    return fail(valid.reason, 422, 'REPLAN_VALIDATION_ERROR');
  }

  try {
    const result = await persistWeeklyReschedule(
      userId,
      parsed.data,
      claim.log._id,
    );
    return { ...result, replayed: false };
  } catch {
    await markLog(claim.log._id, 'persistence_error');
    return fail('Replan persistence failed', 500, 'REPLAN_PERSISTENCE_ERROR');
  }
};
