import { Types } from 'mongoose';
import { AiRequestLogModel, TaskModel } from '@/models/index.js';
import type { TaskBreakdownResponse } from '@/schemas/task-breakdown.js';

type GoalValues = {
  _id: Types.ObjectId;
  importance: 1 | 2 | 3 | 4 | 5;
};

const findGeneratedTasks = (
  userId: Types.ObjectId,
  goalId: Types.ObjectId,
  generationKeyHash: string,
) =>
  TaskModel.find({ generationKeyHash, goalId, userId }).sort({
    generationIndex: 1,
  });

const markSuccess = (logId: Types.ObjectId) =>
  AiRequestLogModel.updateOne(
    { _id: logId },
    { $set: { responseStatus: 'success' }, $unset: { errorMessage: 1 } },
  );

export const persistTaskBreakdown = async (
  userId: Types.ObjectId,
  goal: GoalValues,
  generationKeyHash: string,
  logId: Types.ObjectId,
  output: TaskBreakdownResponse,
) => {
  for (const [generationIndex, task] of output.taskBreakdown.entries()) {
    await TaskModel.updateOne(
      { generationIndex, generationKeyHash, userId },
      {
        $setOnInsert: {
          checklist: task.checklist.map((title) => ({ done: false, title })),
          energyLevel: 'medium',
          estimatedMinutes: task.estimatedMinutes,
          generationIndex,
          generationKeyHash,
          goalId: goal._id,
          goalImpact: goal.importance,
          importance: goal.importance,
          parentTaskId: task.parentTaskId
            ? new Types.ObjectId(task.parentTaskId)
            : undefined,
          postponedCount: 0,
          priorityReason: task.priorityReason,
          status: 'todo',
          title: task.title,
          userId,
        },
      },
      { upsert: true },
    );
  }

  const tasks = await findGeneratedTasks(userId, goal._id, generationKeyHash);
  if (tasks.length !== output.taskBreakdown.length) {
    throw new Error('Task breakdown persistence did not save every task');
  }
  await markSuccess(logId);
  return tasks;
};
