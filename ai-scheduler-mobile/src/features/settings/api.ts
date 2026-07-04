import { apiRequest } from '@/api';
import type { SchedulePreferences } from './types';

export const getSchedulePreferences = () =>
  apiRequest<SchedulePreferences>('/me/schedule-preferences');

export const updateSchedulePreferences = (body: SchedulePreferences) =>
  apiRequest<SchedulePreferences>('/me/schedule-preferences', {
    method: 'PATCH',
    body,
  });
