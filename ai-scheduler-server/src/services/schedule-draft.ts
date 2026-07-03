import { Types } from 'mongoose';
import {
  AiRequestLogModel,
  ScheduleDraftModel,
} from '@/models/index.js';
import { scheduleDraftOutputSchema } from '@/schemas/schedule-draft.js';
import { geminiScheduleGenerator } from './gemini-schedule.js';
import type { ScheduleDraftGenerator } from './schedule-contract.js';
import { hashValue } from './breakdown-idempotency.js';
import { buildScheduleContext } from './schedule-context.js';
import { validateScheduleDraft } from './schedule-validation.js';

export class ScheduleDraftError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'ScheduleDraftError';
  }
}

const fail = (message: string, statusCode: number, code: string) => {
  throw new ScheduleDraftError(message, statusCode, code);
};

const markLog = (
  logId: Types.ObjectId,
  responseStatus: 'success' | 'schema_error' | 'api_error' | 'persistence_error',
) =>
  AiRequestLogModel.updateOne(
    { _id: logId },
    { $set: { errorMessage: responseStatus, responseStatus } },
  );

export const generateDailyScheduleDraft = async (
  userId: Types.ObjectId,
  date: string,
  idempotencyKey: string,
  generator: ScheduleDraftGenerator = geminiScheduleGenerator,
) => {
  const existing = await ScheduleDraftModel.findOne({
    date,
    status: { $in: ['draft', 'approved', 'synced'] },
    userId,
  });
  if (existing) return { draft: existing, replayed: true };

  const context = await buildScheduleContext(userId, date);
  const payloadHash = hashValue(JSON.stringify(context));
  const idempotencyKeyHash = hashValue(`${userId}:${date}:${idempotencyKey}`);
  const [log] = await AiRequestLogModel.create([
    {
      idempotencyKeyHash,
      payloadHash,
      responseStatus: 'in_progress',
      type: 'daily_schedule',
      userId,
    },
  ]);

  let rawOutput: unknown;
  try {
    rawOutput = await generator.generate(context);
  } catch {
    await markLog(log._id, 'api_error');
    return fail('Schedule provider failed', 502, 'SCHEDULE_PROVIDER_ERROR');
  }

  const parsed = scheduleDraftOutputSchema.safeParse(rawOutput);
  if (!parsed.success) {
    await markLog(log._id, 'schema_error');
    return fail('Schedule response was invalid', 422, 'SCHEDULE_SCHEMA_ERROR');
  }

  const valid = validateScheduleDraft(parsed.data, context);
  if (!valid.ok) {
    await markLog(log._id, 'schema_error');
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
    await markLog(log._id, 'success');
    return { draft, replayed: false };
  } catch {
    await markLog(log._id, 'persistence_error');
    return fail(
      'Schedule draft persistence failed',
      500,
      'SCHEDULE_PERSISTENCE_ERROR',
    );
  }
};
