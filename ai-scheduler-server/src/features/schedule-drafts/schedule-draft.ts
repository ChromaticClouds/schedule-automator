import { Types } from 'mongoose';
import { AiRequestLogModel } from '@/models/index.js';
import { scheduleDraftOutputSchema } from './schedule-draft.schema.js';
import { geminiScheduleGenerator } from '@/integrations/gemini/gemini-schedule.js';
import { ScheduleDraftModel } from './schedule-draft.model.js';
import type {
  ScheduleContextBuilder,
  ScheduleDraftGenerator,
} from './schedule-contract.js';
import { hashValue } from '@/shared/idempotency/hash.js';
import {
  classifyGeminiError,
  classifyGoogleCalendarError,
  type ExternalApiErrorDetails,
} from '@/shared/errors/external-api-error.js';
import { buildScheduleContext } from './schedule-context.js';
import { claimDailySchedule } from './schedule-idempotency.js';
import { validateScheduleDraft } from './schedule-validation.js';

export class ScheduleDraftError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: ExternalApiErrorDetails,
  ) {
    super(message);
    this.name = 'ScheduleDraftError';
  }
}

const fail = (
  message: string,
  statusCode: number,
  code: string,
  details?: ExternalApiErrorDetails,
) => {
  throw new ScheduleDraftError(message, statusCode, code, details);
};

const markLog = (
  logId: Types.ObjectId,
  responseStatus: 'success' | 'schema_error' | 'api_error' | 'persistence_error',
) =>
  AiRequestLogModel.updateOne(
    { _id: logId },
    { $set: { errorMessage: responseStatus, responseStatus } },
  );

const isDuplicateKey = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === 11000;

const findActiveDraft = (userId: Types.ObjectId, date: string) =>
  ScheduleDraftModel.findOne({
    date,
    status: { $in: ['draft', 'approved', 'synced'] },
    userId,
  });

export const generateDailyScheduleDraft = async (
  userId: Types.ObjectId,
  date: string,
  idempotencyKey: string,
  generator: ScheduleDraftGenerator = geminiScheduleGenerator,
  contextBuilder: ScheduleContextBuilder = buildScheduleContext,
) => {
  const existing = await findActiveDraft(userId, date);
  if (existing) return { draft: existing, replayed: true };

  let context: Awaited<ReturnType<ScheduleContextBuilder>>;
  try {
    context = await contextBuilder(userId, date);
  } catch (error) {
    const details = classifyGoogleCalendarError(error);
    if (details) {
      return fail('Google Calendar is unavailable', 502, details.code, details);
    }
    throw error;
  }
  const payloadHash = hashValue(JSON.stringify(context));
  const idempotencyKeyHash = hashValue(`${userId}:${date}:${idempotencyKey}`);
  const claim = await claimDailySchedule(userId, idempotencyKeyHash, payloadHash);
  if (claim.kind === 'conflict') {
    return fail('Idempotency key conflict', 409, 'IDEMPOTENCY_CONFLICT');
  }
  if (claim.kind === 'pending') {
    return fail('Schedule draft is in progress', 409, 'REQUEST_IN_PROGRESS');
  }

  let rawOutput: unknown;
  try {
    rawOutput = await generator.generate(context);
  } catch (error) {
    const details = classifyGeminiError(error);
    await markLog(claim.log._id, 'api_error');
    return fail('Schedule provider failed', 502, details.code, details);
  }

  const parsed = scheduleDraftOutputSchema.safeParse(rawOutput);
  if (!parsed.success) {
    await markLog(claim.log._id, 'schema_error');
    return fail('Schedule response was invalid', 422, 'SCHEDULE_SCHEMA_ERROR');
  }

  const valid = validateScheduleDraft(parsed.data, context);
  if (!valid.ok) {
    await markLog(claim.log._id, 'schema_error');
    return fail(valid.reason, 422, 'SCHEDULE_VALIDATION_ERROR');
  }

  try {
    const draft = await ScheduleDraftModel.create({
      assumptions: parsed.data.assumptions,
      blocks: valid.blocks.map((block) => ({
        ...block,
        end: new Date(block.end),
        source: 'ai',
        start: new Date(block.start),
        status: 'draft',
        taskId: block.taskId ? new Types.ObjectId(block.taskId) : undefined,
      })),
      date,
      status: 'draft',
      summary: parsed.data.summary,
      userId,
      warnings: parsed.data.warnings,
    });
    await markLog(claim.log._id, 'success');
    return { draft, replayed: false };
  } catch (error) {
    if (isDuplicateKey(error)) {
      const draft = await findActiveDraft(userId, date);
      if (draft) {
        await markLog(claim.log._id, 'success');
        return { draft, replayed: true };
      }
    }
    await markLog(claim.log._id, 'persistence_error');
    return fail(
      'Schedule draft persistence failed',
      500,
      'SCHEDULE_PERSISTENCE_ERROR',
    );
  }
};
