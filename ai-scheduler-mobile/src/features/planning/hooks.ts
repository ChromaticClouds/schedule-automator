import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/session';

import {
  createGoal,
  createProtectedTime,
  createTask,
  listGoals,
  listProtectedTimes,
  listTasks,
} from './api';

export const planningKeys = {
  goals: ['planning', 'goals'] as const,
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
