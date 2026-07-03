import { apiRequest } from '@/api';
import {
  CreateGoalInput,
  CreateProtectedTimeInput,
  CreateTaskInput,
  Goal,
  ProtectedTime,
  Task,
} from './types';

export const MVP_USER_ID = '000000000000000000000001';

const userHeaders = {
  'x-user-id': MVP_USER_ID,
};

export const listGoals = () =>
  apiRequest<Goal[]>('/goals', {
    headers: userHeaders,
  });

export const createGoal = (body: CreateGoalInput) =>
  apiRequest<Goal>('/goals', {
    method: 'POST',
    headers: userHeaders,
    body,
  });

export const listTasks = () =>
  apiRequest<Task[]>('/tasks', {
    headers: userHeaders,
  });

export const createTask = (body: CreateTaskInput) =>
  apiRequest<Task>('/tasks', {
    method: 'POST',
    headers: userHeaders,
    body,
  });

export const listProtectedTimes = () =>
  apiRequest<ProtectedTime[]>('/protected-times', {
    headers: userHeaders,
  });

export const createProtectedTime = (body: CreateProtectedTimeInput) =>
  apiRequest<ProtectedTime>('/protected-times', {
    method: 'POST',
    headers: userHeaders,
    body,
  });
