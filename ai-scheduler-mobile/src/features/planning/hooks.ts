import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/session';

import {
  approveScheduleDraft,
  createGoal,
  createProtectedTime,
  createTask,
  generateScheduleDraft,
  getScheduleDraft,
  getTaskSummary,
  listGoals,
  listProtectedTimes,
  listTasks,
  rejectScheduleDraft,
} from './api';
import { planningKeys } from './planning-keys';
export { useDeleteTask, useUpdateTask } from './task-mutation-hooks';
export { planningKeys } from './planning-keys';

export const useGoals = () =>
  useQuery({
    queryKey: planningKeys.goals,
    queryFn: listGoals,
    enabled: useAuthStore((state) => state.status === 'authenticated'),
  });

export const useTasks = () =>
  useQuery({
    queryKey: planningKeys.tasks,
    queryFn: listTasks,
    enabled: useAuthStore((state) => state.status === 'authenticated'),
  });

export const useTaskSummary = () =>
  useQuery({
    queryKey: planningKeys.taskSummary,
    queryFn: getTaskSummary,
    enabled: useAuthStore((state) => state.status === 'authenticated'),
  });

export const useProtectedTimes = () =>
  useQuery({
    queryKey: planningKeys.protectedTimes,
    queryFn: listProtectedTimes,
    enabled: useAuthStore((state) => state.status === 'authenticated'),
  });

export const useScheduleDraft = (date: string) =>
  useQuery({
    queryKey: planningKeys.scheduleDraft(date),
    queryFn: () => getScheduleDraft(date),
    enabled: useAuthStore((state) => state.status === 'authenticated'),
    retry: false,
  });

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: planningKeys.goals }),
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: planningKeys.taskSummary }),
        queryClient.invalidateQueries({ queryKey: planningKeys.tasks }),
      ]),
  });
};


export const useCreateProtectedTime = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProtectedTime,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: planningKeys.protectedTimes }),
  });
};

export const useGenerateScheduleDraft = (date: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idempotencyKey: string) =>
      generateScheduleDraft(date, idempotencyKey),
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

export const useApproveScheduleDraft = (date: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveScheduleDraft,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: planningKeys.dailyReview(date),
        }),
        queryClient.invalidateQueries({
          queryKey: planningKeys.scheduleDraft(date),
        }),
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planningKeys.taskSummary });
      queryClient.invalidateQueries({ queryKey: planningKeys.tasks });
    },
  });
};

export const useRejectScheduleDraft = (date: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectScheduleDraft,
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
