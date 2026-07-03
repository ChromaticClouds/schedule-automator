import { startSession, type Types } from 'mongoose';
import { AiRequestLogModel, TaskModel } from '@/models/index.js';
import type { TaskBreakdownResponse } from '@/schemas/task-breakdown.js';

type GoalValues = {
  _id: Types.ObjectId;
  importance: 1 | 2 | 3 | 4 | 5;
};

export const persistTaskBreakdown = async (
  userId: Types.ObjectId,
  goal: GoalValues,
  generationKeyHash: string,
  logId: Types.ObjectId,
  output: TaskBreakdownResponse,
) => {
  const session = await startSession();

  try {
    let tasks: InstanceType<typeof TaskModel>[] = [];
    await session.withTransaction(async () => {
      tasks = await TaskModel.insertMany(
        output.taskBreakdown.map((task, generationIndex) => ({
          checklist: task.checklist.map((title) => ({ done: false, title })),
          energyLevel: 'medium',
          estimatedMinutes: task.estimatedMinutes,
          generationIndex,
          generationKeyHash,
          goalId: goal._id,
          goalImpact: goal.importance,
          importance: goal.importance,
          parentTaskId: task.parentTaskId,
          postponedCount: 0,
          priorityReason: task.priorityReason,
          status: 'todo',
          title: task.title,
          userId,
        })),
        { session },
      );
      await AiRequestLogModel.updateOne(
        { _id: logId },
        { $set: { responseStatus: 'success' }, $unset: { errorMessage: 1 } },
        { session },
      );
    });
    return tasks;
  } finally {
    await session.endSession();
  }
};
