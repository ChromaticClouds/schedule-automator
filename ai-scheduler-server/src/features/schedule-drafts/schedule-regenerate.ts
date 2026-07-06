import { Types } from 'mongoose';
import { ScheduleDraftModel } from './schedule-draft.model.js';
import {
  canRegenerateScheduleDraft,
} from './schedule-lifecycle.js';
import { generateDailyScheduleDraft } from './schedule-draft.js';
import type { ScheduleDraftGenerator } from './schedule-contract.js';

export class ScheduleRegenerateError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'ScheduleRegenerateError';
  }
}

const fail = (message: string, statusCode: number, code: string): never => {
  throw new ScheduleRegenerateError(message, statusCode, code);
};

const retireDraft = async (userId: Types.ObjectId, draftId: Types.ObjectId) => {
  const retired = await ScheduleDraftModel.findOneAndUpdate(
    { _id: draftId, status: 'draft', userId },
    { $set: { status: 'rejected' } },
    { returnDocument: 'after' },
  );
  if (retired) return retired;

  const current = await ScheduleDraftModel.findOne({ _id: draftId, userId });
  if (!current) return fail('Schedule draft not found', 404, 'DRAFT_NOT_FOUND');
  if (!canRegenerateScheduleDraft(current.status)) {
    fail('Schedule draft cannot be regenerated', 409, 'INVALID_DRAFT_STATE');
  }
  return current;
};

export const regenerateScheduleDraft = async (
  userId: Types.ObjectId,
  draftId: Types.ObjectId,
  idempotencyKey: string,
  generator?: ScheduleDraftGenerator,
) => {
  const source = await ScheduleDraftModel.findOne({ _id: draftId, userId });
  if (!source) return fail('Schedule draft not found', 404, 'DRAFT_NOT_FOUND');
  if (!canRegenerateScheduleDraft(source.status)) {
    fail('Schedule draft cannot be regenerated', 409, 'INVALID_DRAFT_STATE');
  }

  const retired = source.status === 'draft'
    ? await retireDraft(userId, draftId)
    : source;

  return generateDailyScheduleDraft(
    userId,
    retired.date,
    idempotencyKey,
    generator,
  );
};
