import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateGoalBreakdown } from './api';
import { planningKeys } from './hooks';

type GoalBreakdownInput = {
  goalId: string;
  idempotencyKey: string;
};

export const useGoalBreakdown = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, idempotencyKey }: GoalBreakdownInput) =>
      generateGoalBreakdown(goalId, idempotencyKey),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: planningKeys.goals }),
        queryClient.invalidateQueries({ queryKey: planningKeys.taskSummary }),
        queryClient.invalidateQueries({ queryKey: planningKeys.tasks }),
      ]),
  });
};
