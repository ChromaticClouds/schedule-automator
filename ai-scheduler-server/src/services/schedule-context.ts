import { Types } from 'mongoose';
import { ProtectedTimeModel, TaskModel } from '@/models/index.js';
import { listOccupiedEvents } from './calendar-events.js';
import { createGoogleCalendarClient } from './google-client.js';

const dayRange = (date: string) => ({
  timeMax: `${date}T23:59:59.999Z`,
  timeMin: `${date}T00:00:00.000Z`,
});

const protectedIntervals = async (userId: Types.ObjectId, date: string) => {
  const day = new Date(`${date}T00:00:00.000Z`).getUTCDay();
  const blocks = await ProtectedTimeModel.find({
    daysOfWeek: day,
    protectionLevel: 'hard',
    userId,
  }).lean();
  return blocks.map((block) => ({
    end: `${date}T${block.endTime}:00.000Z`,
    start: `${date}T${block.startTime}:00.000Z`,
    title: block.title,
  }));
};

export const buildScheduleContext = async (
  userId: Types.ObjectId,
  date: string,
) => {
  const tasks = await TaskModel.find({
    status: { $in: ['todo', 'missed'] },
    userId,
  })
    .select({ _id: 1, estimatedMinutes: 1, importance: 1, title: 1 })
    .sort({ importance: -1, createdAt: 1, _id: 1 })
    .limit(40)
    .lean();
  const { api } = await createGoogleCalendarClient(userId);
  const busy = await listOccupiedEvents(api, dayRange(date));

  return {
    busy: busy.map((event) => ({
      end: event.end,
      source: 'calendar',
      start: event.start,
      title: event.eventId,
    })),
    date,
    protected: await protectedIntervals(userId, date),
    tasks: tasks.map((task) => ({
      estimatedMinutes: task.estimatedMinutes,
      id: task._id.toString(),
      importance: task.importance,
      title: task.title,
    })),
  };
};
