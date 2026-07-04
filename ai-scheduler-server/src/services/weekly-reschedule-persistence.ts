import { connection, Types } from 'mongoose';
import {
  AiRequestLogModel,
  ScheduleDraftModel,
  TaskModel,
} from '@/models/index.js';
import type { WeeklyRescheduleOutput } from '@/schemas/weekly-reschedule.js';

const groupByDate = (output: WeeklyRescheduleOutput) => {
  const groups = new Map<string, WeeklyRescheduleOutput['placements']>();
  for (const placement of output.placements) {
    groups.set(placement.date, [
      ...(groups.get(placement.date) ?? []),
      placement,
    ]);
  }
  return groups;
};

export const persistWeeklyReschedule = async (
  userId: Types.ObjectId,
  output: WeeklyRescheduleOutput,
  logId: Types.ObjectId,
) => connection.transaction(async (session) => {
  const drafts = [];
  for (const [date, placements] of groupByDate(output)) {
    const blocks = placements.map((placement) => ({
      end: new Date(placement.end),
      reason: placement.reason,
      source: 'ai',
      start: new Date(placement.start),
      status: 'draft',
      taskId: new Types.ObjectId(placement.taskId),
      title: placement.title,
      type: 'task',
    }));
    const existing = await ScheduleDraftModel.findOne({
      date,
      status: { $in: ['draft', 'approved', 'synced'] },
      userId,
    }).session(session);
    if (existing && existing.status !== 'draft') {
      throw new Error('schedule_draft_changed');
    }
    if (existing) {
      existing.blocks.push(...blocks);
      existing.summary = output.summary;
      existing.warnings = output.warnings;
      drafts.push(await existing.save({ session }));
    } else {
      const [draft] = await ScheduleDraftModel.create([{
        assumptions: [],
        blocks,
        date,
        status: 'draft',
        summary: output.summary,
        userId,
        warnings: output.warnings,
      }], { session });
      drafts.push(draft);
    }
  }

  const placedTaskIds = output.placements.map(({ taskId }) => taskId);
  await TaskModel.updateMany(
    { _id: { $in: output.overflowTaskIds }, status: 'missed', userId },
    { $set: { status: 'overflow' } },
    { session },
  );
  await AiRequestLogModel.updateOne(
    { _id: logId },
    { $set: { errorMessage: 'success', responseStatus: 'success' } },
    { session },
  );
  return { drafts, overflowTaskIds: output.overflowTaskIds, placedTaskIds };
});
