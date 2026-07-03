import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/session';

import {
  approveScheduleDraft,
  createGoal,
  createProtectedTime,
  createTask,
  generateScheduleDraft,
  getScheduleDraft,
  listGoals,
  listProtectedTimes,
  listTasks,
  rejectScheduleDraft,
} from './api';

export const planningKeys = {
  dailyReview: (date: string) => ['planning', 'daily-review', date] as const,
  goals: ['planning', 'goals'] as const,
  scheduleDraft: (date: string) => ['planning', 'schedule-draft', date] as const,
  tasks: ['planning', 'tasks'] as const,
  protectedTimes: ['planning', 'protected-times'] as const,
};

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: planningKeys.tasks }),
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
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: planningKeys.scheduleDraft(date),
      }),
  });
};

export const useApproveScheduleDraft = (date: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveScheduleDraft,
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: planningKeys.scheduleDraft(date),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planningKeys.tasks });
    },
  });
};

export const useRejectScheduleDraft = (date: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectScheduleDraft,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: planningKeys.scheduleDraft(date),
      }),
  });
};
