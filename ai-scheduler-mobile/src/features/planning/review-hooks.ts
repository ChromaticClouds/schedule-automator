import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/session';
import { getDailyReview, saveDailyReview } from './api';
import { planningKeys } from './hooks';
import type { SaveDailyReviewInput } from './types';

export const useDailyReview = (date: string) =>
  useQuery({
    queryKey: planningKeys.dailyReview(date),
    queryFn: () => getDailyReview(date),
    enabled: useAuthStore((state) => state.status === 'authenticated'),
  });

export const useSaveDailyReview = (date: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveDailyReviewInput) =>
      saveDailyReview(date, input),
    onSuccess: (result) => {
      queryClient.setQueryData(planningKeys.dailyReview(date), result);
      queryClient.invalidateQueries({ queryKey: planningKeys.tasks });
      queryClient.invalidateQueries({
        queryKey: planningKeys.scheduleDraft(date),
      });
    },
  });
};
