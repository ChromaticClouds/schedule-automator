import { apiRequest } from '@/api';
import {
  CreateGoalInput,
  CreateProtectedTimeInput,
  CreateTaskInput,
  Goal,
  ProtectedTime,
  Task,
} from './types';

export const listGoals = () =>
  apiRequest<Goal[]>('/goals');

export const createGoal = (body: CreateGoalInput) =>
  apiRequest<Goal>('/goals', {
    method: 'POST',
    body,
  });

export const listTasks = () =>
  apiRequest<Task[]>('/tasks');

export const createTask = (body: CreateTaskInput) =>
  apiRequest<Task>('/tasks', {
    method: 'POST',
    body,
  });

export const listProtectedTimes = () =>
  apiRequest<ProtectedTime[]>('/protected-times');

export const createProtectedTime = (body: CreateProtectedTimeInput) =>
  apiRequest<ProtectedTime>('/protected-times', {
    method: 'POST',
    body,
  });
