import { AiRequestLogModel, TaskModel } from '@/models/index.js';

const claimLeaseMs = 10 * 60 * 1000;

const isDuplicateKey = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  error.code === 11000;

export const claimTaskBreakdown = async (
  userId: Parameters<typeof AiRequestLogModel.create>[0]['userId'],
  goalId: Parameters<typeof AiRequestLogModel.create>[0]['goalId'],
  idempotencyKeyHash: string,
  payloadHash: string,
) => {
  const now = new Date();
  try {
    const log = await AiRequestLogModel.create({
      createdAt: now,
      goalId,
      idempotencyKeyHash,
      payloadHash,
      responseStatus: 'in_progress',
      type: 'task_breakdown',
      userId,
    });
    return { kind: 'claimed' as const, log };
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
  }

  const existing = await AiRequestLogModel.findOne({
    goalId,
    idempotencyKeyHash,
    type: 'task_breakdown',
    userId,
  });
  if (!existing || existing.payloadHash !== payloadHash) {
    return { kind: 'conflict' as const };
  }
  if (existing.responseStatus === 'success') {
    const tasks = await TaskModel.find({
      generationKeyHash: idempotencyKeyHash,
      goalId,
      userId,
    }).sort({ generationIndex: 1 });
    return { kind: 'replay' as const, tasks };
  }
  if (existing.responseStatus === 'in_progress') {
    const staleBefore = new Date(now.getTime() - claimLeaseMs);
    if (existing.createdAt > staleBefore) {
      return { kind: 'pending' as const };
    }
  }

  const claimed = await AiRequestLogModel.findOneAndUpdate(
    {
      _id: existing._id,
      responseStatus: existing.responseStatus,
      ...(existing.responseStatus === 'in_progress'
        ? { createdAt: { $lte: new Date(now.getTime() - claimLeaseMs) } }
        : {}),
    },
    {
      $set: { createdAt: now, responseStatus: 'in_progress' },
      $unset: { errorMessage: 1 },
    },
    { returnDocument: 'after' },
  );
  return claimed
    ? { kind: 'claimed' as const, log: claimed }
    : { kind: 'pending' as const };
};

export const markTaskBreakdownFailure = async (
  logId: Parameters<typeof AiRequestLogModel.findByIdAndUpdate>[0],
  status: 'api_error' | 'schema_error' | 'persistence_error',
) => {
  await AiRequestLogModel.updateOne(
    { _id: logId },
    { $set: { errorMessage: status, responseStatus: status } },
  );
};
