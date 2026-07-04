import type { WeeklyRescheduleResult } from './types';

type ApiLikeError = {
  details?: unknown;
  message?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const hasUnprocessedMissedTasks = (
  currentTaskIds: string[],
  processedTaskIds: string[],
) => {
  const processed = new Set(processedTaskIds);
  return currentTaskIds.some((taskId) => !processed.has(taskId));
};

export const weeklyRescheduleDetailCode = (error: unknown) => {
  if (!isRecord(error)) return undefined;
  const details = (error as ApiLikeError).details;
  if (!isRecord(details) || !isRecord(details.details)) return undefined;
  return typeof details.details.code === 'string'
    ? details.details.code
    : undefined;
};

export const weeklyRescheduleErrorMessage = (error: unknown) => {
  const code = weeklyRescheduleDetailCode(error);
  if (code === 'REQUEST_IN_PROGRESS') return 'A weekly replan is already running.';
  if (code === 'IDEMPOTENCY_CONFLICT') return 'Planning context changed. Try again.';
  if (code === 'REPLAN_PROVIDER_ERROR') return 'The planning provider is unavailable.';
  if (code === 'REPLAN_SCHEMA_ERROR') return 'The generated plan format was invalid.';
  if (code === 'REPLAN_VALIDATION_ERROR') return 'The generated plan was not safe to use.';
  if (code === 'REPLAN_PERSISTENCE_ERROR') return 'Could not save the generated plan. Try again.';
  if (code === 'GOOGLE_RECONNECT_REQUIRED') return 'Google Calendar connection expired. Reconnect Google.';
  return isRecord(error) && typeof error.message === 'string'
    ? error.message
    : undefined;
};

export const weeklyRescheduleResultSummary = (
  result: WeeklyRescheduleResult,
) => `Placed ${result.placedTaskIds.length} · Overflow ${result.overflowTaskIds.length}`;
