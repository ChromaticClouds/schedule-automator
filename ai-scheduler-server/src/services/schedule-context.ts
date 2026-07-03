import { Types } from 'mongoose';
import { ENV } from '@/config/env.js';
import { ProtectedTimeModel, TaskModel, UserModel } from '@/models/index.js';
import { listOccupiedEvents } from './calendar-events.js';
import { createGoogleCalendarClient } from './google-client.js';
import { addDays, zonedDateTime, zonedDayRange } from './schedule-time.js';

const timeValue = (value: string) => `${value}:00.000`;

const isOvernight = (startTime: string, endTime: string) =>
  endTime <= startTime;

const pushProtectedInterval = (
  intervals: { end: string; start: string; title: string }[],
  block: { endTime: string; startTime: string; title: string },
  startDate: string,
  timeZone: string,
) => {
  const endDate = isOvernight(block.startTime, block.endTime)
    ? addDays(startDate, 1)
    : startDate;
  intervals.push({
    end: zonedDateTime(endDate, timeValue(block.endTime), timeZone),
    start: zonedDateTime(startDate, timeValue(block.startTime), timeZone),
    title: block.title,
  });
};

const protectedIntervals = async (
  userId: Types.ObjectId,
  date: string,
  timeZone: string,
) => {
  const day = new Date(`${date}T00:00:00.000Z`).getUTCDay();
  const previousDay = (day + 6) % 7;
  const blocks = await ProtectedTimeModel.find({
    daysOfWeek: { $in: [day, previousDay] },
    protectionLevel: 'hard',
    userId,
  }).lean();
  const intervals: { end: string; start: string; title: string }[] = [];

  for (const block of blocks) {
    if (block.daysOfWeek.includes(day)) {
      pushProtectedInterval(intervals, block, date, timeZone);
    }
    if (block.daysOfWeek.includes(previousDay) && isOvernight(
      block.startTime,
      block.endTime,
    )) {
      pushProtectedInterval(intervals, block, addDays(date, -1), timeZone);
    }
  }

  return intervals;
};

export const buildScheduleContext = async (
  userId: Types.ObjectId,
  date: string,
) => {
  const user = await UserModel.findById(userId)
    .select({ maxDailyWorkMinutes: 1, timezone: 1 })
    .lean();
  const timeZone = user?.timezone ?? ENV.APP_TIMEZONE;
  const tasks = await TaskModel.find({
    status: { $in: ['todo', 'missed'] },
    userId,
  })
    .select({ _id: 1, estimatedMinutes: 1, importance: 1, title: 1 })
    .sort({ importance: -1, createdAt: 1, _id: 1 })
    .limit(40)
    .lean();
  const { api } = await createGoogleCalendarClient(userId);
  const busy = await listOccupiedEvents(api, zonedDayRange(date, timeZone));

  return {
    busy: busy.map((event) => ({
      end: event.end,
      source: 'calendar',
      start: event.start,
      title: event.eventId,
    })),
    date,
    maxDailyWorkMinutes:
      user?.maxDailyWorkMinutes ?? ENV.MAX_DAILY_WORK_MINUTES,
    protected: await protectedIntervals(userId, date, timeZone),
    tasks: tasks.map((task) => ({
      estimatedMinutes: task.estimatedMinutes,
      id: task._id.toString(),
      importance: task.importance,
      title: task.title,
    })),
  };
};
