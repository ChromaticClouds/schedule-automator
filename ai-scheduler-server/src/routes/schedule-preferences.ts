import type { FastifyInstance } from 'fastify';
import { UserModel } from '@/models/index.js';
import {
  schedulePreferencesSchema,
  updateSchedulePreferencesSchema,
} from '@/schemas/schedule-preferences.js';
import { notFound, parseBody, requireUserId } from './http.js';

const selectPreferences = {
  maxDailyWorkMinutes: 1,
  timezone: 1,
  wakeOffsetMinutes: 1,
  wakeTime: 1,
};

const normalizePreferences = (user: {
  maxDailyWorkMinutes: number;
  timezone: string;
  wakeOffsetMinutes: number;
  wakeTime: string;
}) => schedulePreferencesSchema.parse({
  maxDailyWorkMinutes: user.maxDailyWorkMinutes,
  timezone: user.timezone,
  wakeOffsetMinutes: user.wakeOffsetMinutes,
  wakeTime: user.wakeTime,
});

export const registerSchedulePreferenceRoutes = async (
  app: FastifyInstance,
) => {
  app.get('/me/schedule-preferences', async (request) => {
    const userId = requireUserId(request);
    const user = await UserModel.findById(userId).select(selectPreferences);
    return user ? normalizePreferences(user) : notFound('User');
  });

  app.patch('/me/schedule-preferences', async (request) => {
    const userId = requireUserId(request);
    const input = parseBody(updateSchedulePreferencesSchema, request);
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: input },
      { new: true, runValidators: true },
    ).select(selectPreferences);
    return user ? normalizePreferences(user) : notFound('User');
  });
};
