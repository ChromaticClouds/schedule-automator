import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editScheduleBlock } from './api';
import { planningKeys } from './hooks';
import type { ScheduleBlockEditInput } from './types';

type EditScheduleBlockInput = {
  blockId: string;
  body: ScheduleBlockEditInput;
  draftId: string;
};

export const useEditScheduleBlock = (date: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ blockId, body, draftId }: EditScheduleBlockInput) =>
      editScheduleBlock(draftId, blockId, body),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: planningKeys.scheduleDraft(date),
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(
        planningKeys.scheduleDraft(date),
        result.draft,
      );
      return queryClient.invalidateQueries({
        queryKey: planningKeys.taskSummary,
      });
    },
  });
};
