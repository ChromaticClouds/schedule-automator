import { apiRequest } from '@/api';
import {
  CreateGoalInput,
  CreateProtectedTimeInput,
  CreateTaskInput,
  Goal,
  ProtectedTime,
  ScheduleDraft,
  ScheduleDraftResult,
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

export const getScheduleDraft = (date?: string) =>
  apiRequest<ScheduleDraft>(
    `/schedule-drafts${date ? `?date=${encodeURIComponent(date)}` : ''}`,
  );

export const generateScheduleDraft = (
  date: string,
  idempotencyKey: string,
) =>
  apiRequest<ScheduleDraftResult>('/schedule-drafts', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: { date },
  });

export const approveScheduleDraft = (id: string) =>
  apiRequest<ScheduleDraftResult>(`/schedule-drafts/${id}/approve`, {
    method: 'POST',
  });

export const rejectScheduleDraft = (id: string) =>
  apiRequest<ScheduleDraftResult>(`/schedule-drafts/${id}/reject`, {
    method: 'POST',
  });
