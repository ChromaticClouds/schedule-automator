import { useMutation, useQueryClient } from '@tanstack/react-query';
import { regenerateScheduleDraft } from './api';
import { planningKeys } from './hooks';

type RegenerateInput = {
  draftId: string;
  idempotencyKey: string;
};

export const useRegenerateScheduleDraft = (date: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ draftId, idempotencyKey }: RegenerateInput) =>
      regenerateScheduleDraft(draftId, idempotencyKey),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: planningKeys.scheduleDraft(date),
      });
      queryClient.invalidateQueries({
        queryKey: planningKeys.dailyReview(date),
      });
    },
  });
};
