import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
  });

export const useTasks = () =>
  useQuery({
    queryKey: planningKeys.tasks,
    queryFn: listTasks,
  });

export const useProtectedTimes = () =>
  useQuery({
    queryKey: planningKeys.protectedTimes,
    queryFn: listProtectedTimes,
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
