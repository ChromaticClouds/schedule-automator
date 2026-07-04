import {
  GoogleConnectionModel,
  TaskModel,
  UserModel,
} from '@/models/index.js';
import type { DailyScheduleStore } from './daily-schedule-types.js';

export const mongoDailyScheduleStore: DailyScheduleStore = {
  async createDailySchedule(document) {
    await TaskModel.create(document);
  },
  async hasDailySchedule(userId, generationKeyHash) {
    const existing = await TaskModel.exists({
      generationIndex: 0,
      generationKeyHash,
      userId,
    });
    return Boolean(existing);
  },
  async hasGoogleConnection(userId) {
    return Boolean(await GoogleConnectionModel.exists({ userId }));
  },
  async listCandidateTasks(userId) {
    const tasks = await TaskModel.find({
      status: { $in: ['todo', 'overflow'] },
      userId,
    })
      .sort({ deadline: 1, importance: -1 })
      .limit(8)
      .lean();
    return tasks.map((task) => ({
      estimatedMinutes: task.estimatedMinutes,
      title: task.title,
    }));
  },
  async listUsers() {
    const users = await UserModel.find({})
      .select({
        maxDailyWorkMinutes: 1,
        timezone: 1,
        wakeOffsetMinutes: 1,
        wakeTime: 1,
      })
      .lean();
    return users.map((user) => ({
      _id: user._id.toString(),
      maxDailyWorkMinutes: user.maxDailyWorkMinutes,
      timezone: user.timezone,
      wakeOffsetMinutes: user.wakeOffsetMinutes,
      wakeTime: user.wakeTime,
    }));
  },
};
