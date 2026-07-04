import { apiRequest } from '@/api';
import {
  CreateGoalInput,
  CreateProtectedTimeInput,
  CreateTaskInput,
  DailyReviewResult,
  Goal,
  GoalBreakdownResult,
  ProtectedTime,
  ScheduleBlockEditInput,
  ScheduleDraft,
  ScheduleDraftResult,
  SaveDailyReviewInput,
  Task,
  TaskSummary,
  WeeklyRescheduleInput,
  WeeklyRescheduleResult,
} from './types';

export const listGoals = () =>
  apiRequest<Goal[]>('/goals');

export const createGoal = (body: CreateGoalInput) =>
  apiRequest<Goal>('/goals', {
    method: 'POST',
    body,
  });

export const generateGoalBreakdown = (
  goalId: string,
  idempotencyKey: string,
) =>
  apiRequest<GoalBreakdownResult>(`/goals/${goalId}/task-breakdown`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
  });

export const listTasks = () =>
  apiRequest<Task[]>('/tasks');

export const getTaskSummary = () =>
  apiRequest<TaskSummary>('/tasks/summary');

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

export const regenerateScheduleDraft = (
  id: string,
  idempotencyKey: string,
) =>
  apiRequest<ScheduleDraftResult>(`/schedule-drafts/${id}/regenerate`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
  });

export const editScheduleBlock = (
  draftId: string,
  blockId: string,
  body: ScheduleBlockEditInput,
) =>
  apiRequest<ScheduleDraftResult>(
    `/schedule-drafts/${draftId}/blocks/${blockId}`,
    { body, method: 'PATCH' },
  );

export const getDailyReview = (date: string) =>
  apiRequest<DailyReviewResult>(
    `/daily-reviews?date=${encodeURIComponent(date)}`,
  );

export const saveDailyReview = (
  date: string,
  body: SaveDailyReviewInput,
) =>
  apiRequest<DailyReviewResult>(
    `/daily-reviews/${encodeURIComponent(date)}`,
    { method: 'PUT', body },
  );

export const runWeeklyReschedule = ({
  idempotencyKey,
  reviewDate,
}: WeeklyRescheduleInput) =>
  apiRequest<WeeklyRescheduleResult>('/weekly-reschedules', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: { reviewDate },
  });
