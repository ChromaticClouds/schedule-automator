import { Types } from 'mongoose';
import { ScheduleDraftModel } from '@/models/index.js';

export class ScheduleLifecycleError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'ScheduleLifecycleError';
  }
}

const fail = (message: string, statusCode: number, code: string): never => {
  throw new ScheduleLifecycleError(message, statusCode, code);
};

export const canRejectScheduleDraft = (status: string) =>
  status === 'draft' || status === 'rejected';

export const canRegenerateScheduleDraft = (status: string) =>
  status === 'draft' || status === 'rejected' || status === 'expired';

export const getScheduleDraft = async (
  userId: Types.ObjectId,
  date?: string,
) => {
  const draft = await ScheduleDraftModel.findOne({
    userId,
    ...(date ? { date } : {}),
  }).sort({ date: -1, generatedAt: -1, _id: -1 });

  if (!draft) fail('Schedule draft not found', 404, 'DRAFT_NOT_FOUND');
  return draft;
};

export const rejectScheduleDraft = async (
  userId: Types.ObjectId,
  draftId: Types.ObjectId,
) => {
  const rejected = await ScheduleDraftModel.findOneAndUpdate(
    { _id: draftId, userId, status: 'draft' },
    { $set: { status: 'rejected' } },
    { returnDocument: 'after' },
  );
  if (rejected) return { draft: rejected, replayed: false };

  const current = await ScheduleDraftModel.findOne({ _id: draftId, userId });
  if (!current) {
    return fail('Schedule draft not found', 404, 'DRAFT_NOT_FOUND');
  }
  if (current.status === 'rejected') {
    return { draft: current, replayed: true };
  }
  return fail(
    'Schedule draft cannot be rejected',
    409,
    'INVALID_DRAFT_STATE',
  );
};
