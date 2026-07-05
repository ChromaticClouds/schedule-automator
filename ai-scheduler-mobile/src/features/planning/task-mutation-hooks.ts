import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTask, updateTask } from './api';
import { planningKeys } from './planning-keys';
import type { CreateTaskInput } from './types';

type UpdateTaskVariables = Partial<CreateTaskInput> & { id: string };

const invalidateTasks = (queryClient: ReturnType<typeof useQueryClient>) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: planningKeys.taskSummary }),
    queryClient.invalidateQueries({ queryKey: planningKeys.tasks }),
  ]);

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateTaskVariables) => updateTask(id, body),
    onSuccess: () => invalidateTasks(queryClient),
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => invalidateTasks(queryClient),
  });
};
