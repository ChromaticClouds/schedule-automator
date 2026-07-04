import { Types } from 'mongoose';
import { ScheduleDraftModel, TaskModel } from '@/models/index.js';
import { buildScheduleContext } from './schedule-context.js';
import type {
  WeeklyRescheduleContext,
  WeeklyRescheduleDay,
} from './weekly-reschedule-contract.js';
import { remainingWeekDates } from './weekly-reschedule-contract.js';

const minutesBetween = (start: Date, end: Date) =>
  Math.max(0, (end.getTime() - start.getTime()) / 60_000);

const buildDay = async (
  userId: Types.ObjectId,
  date: string,
): Promise<WeeklyRescheduleDay> => {
  const [context, draft] = await Promise.all([
    buildScheduleContext(userId, date),
    ScheduleDraftModel.findOne({
      date,
      status: { $in: ['draft', 'approved', 'synced'] },
      userId,
    }).lean(),
  ]);
  const draftBlocks = (draft?.blocks ?? []).map(({ end, start }) => ({
    end: end.toISOString(),
    start: start.toISOString(),
  }));
  const scheduledTaskMinutes = (draft?.blocks ?? [])
    .filter(({ type }) => type === 'task')
    .reduce((total, block) => total + minutesBetween(block.start, block.end), 0);

  return {
    acceptsDraftChanges: !draft || draft.status === 'draft',
    blocked: [
      ...context.busy.map(({ end, start }) => ({ end, start })),
      ...context.protected,
      ...draftBlocks,
    ],
    date,
    maxDailyWorkMinutes: context.maxDailyWorkMinutes,
    scheduledTaskMinutes,
  };
};

export const buildWeeklyRescheduleContext = async (
  userId: Types.ObjectId,
  reviewDate: string,
): Promise<WeeklyRescheduleContext> => {
  const tasks = await TaskModel.find({ status: 'missed', userId })
    .select({
      estimatedMinutes: 1,
      goalImpact: 1,
      importance: 1,
      postponedCount: 1,
      title: 1,
    })
    .sort({ importance: -1, goalImpact: -1, postponedCount: -1, _id: 1 })
    .limit(40)
    .lean();

  return {
    days: await Promise.all(
      remainingWeekDates(reviewDate).map((date) => buildDay(userId, date)),
    ),
    reviewDate,
    tasks: tasks.map((task) => ({
      estimatedMinutes: task.estimatedMinutes,
      goalImpact: task.goalImpact,
      id: task._id.toString(),
      importance: task.importance,
      postponedCount: task.postponedCount,
      title: task.title,
    })),
  };
};
