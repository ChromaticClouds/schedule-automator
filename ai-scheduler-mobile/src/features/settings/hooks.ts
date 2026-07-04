import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/session';
import {
  getSchedulePreferences,
  updateSchedulePreferences,
} from './api';

export const schedulePreferenceKey = [
  'planning',
  'schedule-preferences',
] as const;

export const useSchedulePreferences = () =>
  useQuery({
    queryKey: schedulePreferenceKey,
    queryFn: getSchedulePreferences,
    enabled: useAuthStore((state) => state.status === 'authenticated'),
  });

export const useUpdateSchedulePreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSchedulePreferences,
    onSuccess: (preferences) => {
      queryClient.setQueryData(schedulePreferenceKey, preferences);
      queryClient.invalidateQueries({
        queryKey: ['planning', 'schedule-draft'],
      });
    },
  });
};
