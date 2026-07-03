import { type Types } from 'mongoose';
import { AiRequestLogModel } from '@/models/index.js';

const isDuplicateKey = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === 11000;

export const claimDailySchedule = async (
  userId: Types.ObjectId,
  idempotencyKeyHash: string,
  payloadHash: string,
) => {
  try {
    const [log] = await AiRequestLogModel.create([
      {
        idempotencyKeyHash,
        payloadHash,
        responseStatus: 'in_progress',
        type: 'daily_schedule',
        userId,
      },
    ]);
    return { kind: 'claimed' as const, log };
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
  }

  const existing = await AiRequestLogModel.findOne({
    idempotencyKeyHash,
    type: 'daily_schedule',
    userId,
  });
  if (!existing || existing.payloadHash !== payloadHash) {
    return { kind: 'conflict' as const };
  }
  if (existing.responseStatus === 'in_progress') {
    return { kind: 'pending' as const };
  }

  const claimed = await AiRequestLogModel.findOneAndUpdate(
    { _id: existing._id, responseStatus: existing.responseStatus },
    {
      $set: { responseStatus: 'in_progress' },
      $unset: { errorMessage: 1 },
    },
    { returnDocument: 'after' },
  );
  return claimed
    ? { kind: 'claimed' as const, log: claimed }
    : { kind: 'pending' as const };
};
