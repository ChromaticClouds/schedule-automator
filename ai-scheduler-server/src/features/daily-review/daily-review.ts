import { connection, Types, type ClientSession } from 'mongoose';
import {
  ScheduleDraftModel,
  TaskModel,
} from '@/models/index.js';
import type { SaveDailyReviewInput } from './daily-review.schema.js';
import { DailyReviewModel } from './daily-review.model.js';
import {
  buildTaskReviewUpdates,
  collectReviewTaskIds,
} from './daily-review-transition.js';

export class DailyReviewError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'DailyReviewError';
  }
}

const taskIdsForDate = async (
  userId: Types.ObjectId,
  date: string,
  session?: ClientSession,
) => {
  const query = ScheduleDraftModel.findOne({ userId, date }).sort({
    generatedAt: -1,
  });
  if (session) query.session(session);
  const draft = await query;
  return (draft?.blocks ?? [])
    .filter((block) => block.type === 'task' && block.taskId)
    .map((block) => block.taskId as Types.ObjectId);
};

export const getDailyReview = async (
  userId: Types.ObjectId,
  date: string,
) => {
  const review = await DailyReviewModel.findOne({ userId, date });
  const ids = collectReviewTaskIds(
    (await taskIdsForDate(userId, date)).map(String),
    {
      completedTaskIds: (review?.completedTaskIds ?? []).map(String),
      missedTaskIds: (review?.missedTaskIds ?? []).map(String),
    },
  );
  const tasks = await TaskModel.find({ _id: { $in: ids }, userId });
  return { review, tasks };
};

export const saveDailyReview = async (
  userId: Types.ObjectId,
  date: string,
  input: SaveDailyReviewInput,
) => connection.transaction(async (session) => {
  const requestedIds = [...input.completedTaskIds, ...input.missedTaskIds];
  const ownedCount = await TaskModel.countDocuments({
    _id: { $in: requestedIds },
    userId,
  }).session(session);
  if (ownedCount !== requestedIds.length) {
    throw new DailyReviewError(
      'One or more tasks are unavailable',
      404,
      'TASK_NOT_FOUND',
    );
  }

  const previous = await DailyReviewModel.findOne({ userId, date }).session(
    session,
  );
  const updates = buildTaskReviewUpdates(
    {
      completedTaskIds: (previous?.completedTaskIds ?? []).map(String),
      missedTaskIds: (previous?.missedTaskIds ?? []).map(String),
    },
    input,
  );
  for (const update of updates) {
    await TaskModel.updateOne(
      { _id: update.taskId, userId },
      [
        {
          $set: {
            postponedCount: {
              $max: [0, { $add: ['$postponedCount', update.postponedDelta] }],
            },
            status: update.status,
          },
        },
      ],
      { session },
    );
  }

  const review = await DailyReviewModel.findOneAndUpdate(
    { userId, date },
    { $set: input },
    { returnDocument: 'after', runValidators: true, session, upsert: true },
  );
  const responseIds = collectReviewTaskIds(
    (await taskIdsForDate(userId, date, session)).map(String),
    input,
  );
  const tasks = await TaskModel.find({
    _id: { $in: responseIds },
    userId,
  }).session(session);
  return { review, tasks };
});
