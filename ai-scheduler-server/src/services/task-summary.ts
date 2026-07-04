import { Types } from 'mongoose';
import { ENV } from '@/config/env.js';
import { TaskModel, UserModel } from '@/models/index.js';
import {
  taskSummaryResponseSchema,
  type TaskSummaryQuery,
} from '@/schemas/task-summary.js';
import { addDays, zonedDateTime } from './schedule-time.js';

type SummaryBucket = {
  _id: string;
  count: number;
  estimatedMinutes: number;
};

type SummaryItem = {
  _id: Types.ObjectId;
  deadline?: Date;
  estimatedMinutes: number;
  status: string;
  title: string;
};

type SummaryAggregation = {
  buckets: SummaryBucket[];
  items: SummaryItem[];
};

const dateBoundary = (date: string, timezone: string) =>
  new Date(zonedDateTime(date, '00:00:00.000', timezone));

export const taskSummaryMatch = (
  userId: Types.ObjectId,
  query: TaskSummaryQuery,
  timezone: string,
) => ({
  ...(query.from || query.to
    ? {
        deadline: {
          ...(query.from
            ? { $gte: dateBoundary(query.from, timezone) }
            : {}),
          ...(query.to
            ? { $lt: dateBoundary(addDays(query.to, 1), timezone) }
            : {}),
        },
      }
    : {}),
  status: { $in: query.statuses },
  userId,
});

const aggregateSummary = async (
  userId: Types.ObjectId,
  query: TaskSummaryQuery,
  timezone: string,
) => {
  const [result] = await TaskModel.aggregate<SummaryAggregation>([
    { $match: taskSummaryMatch(userId, query, timezone) },
    {
      $facet: {
        buckets: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              estimatedMinutes: { $sum: '$estimatedMinutes' },
            },
          },
        ],
        items: [
          { $sort: { deadline: 1, createdAt: -1 } },
          { $limit: query.limit },
          {
            $project: {
              deadline: 1,
              estimatedMinutes: 1,
              status: 1,
              title: 1,
            },
          },
        ],
      },
    },
  ]);
  return result ?? { buckets: [], items: [] };
};

export const taskSummaryResponse = (
  query: TaskSummaryQuery,
  result: SummaryAggregation,
) => {
  const byStatus = Object.fromEntries(
    query.statuses.map((status) => [
      status,
      { count: 0, estimatedMinutes: 0 },
    ]),
  );
  for (const bucket of result.buckets) {
    if (byStatus[bucket._id]) {
      byStatus[bucket._id] = {
        count: bucket.count,
        estimatedMinutes: bucket.estimatedMinutes,
      };
    }
  }
  return taskSummaryResponseSchema.parse({
    byStatus,
    range: { from: query.from, to: query.to },
    statuses: query.statuses,
    tasks: result.items.map((task) => ({
      _id: task._id.toString(),
      deadline: task.deadline?.toISOString(),
      estimatedMinutes: task.estimatedMinutes,
      status: task.status,
      title: task.title,
    })),
    totals: result.buckets.reduce(
      (total, bucket) => ({
        count: total.count + bucket.count,
        estimatedMinutes:
          total.estimatedMinutes + bucket.estimatedMinutes,
      }),
      { count: 0, estimatedMinutes: 0 },
    ),
  });
};

export const getTaskSummary = async (
  userId: Types.ObjectId,
  query: TaskSummaryQuery,
) => {
  const user = await UserModel.findById(userId).select({ timezone: 1 }).lean();
  const timezone = user?.timezone ?? ENV.APP_TIMEZONE;
  return taskSummaryResponse(
    query,
    await aggregateSummary(userId, query, timezone),
  );
};
