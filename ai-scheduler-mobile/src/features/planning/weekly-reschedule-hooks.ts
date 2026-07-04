import { useMutation, useQueryClient } from '@tanstack/react-query';
import { runWeeklyReschedule } from './api';
import { planningKeys } from './hooks';

export const useWeeklyReschedule = (reviewDate: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idempotencyKey: string) =>
      runWeeklyReschedule({ idempotencyKey, reviewDate }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: planningKeys.dailyReview(reviewDate),
        }),
        queryClient.invalidateQueries({
          queryKey: planningKeys.scheduleDrafts,
        }),
        queryClient.invalidateQueries({ queryKey: planningKeys.tasks }),
      ]),
  });
};
