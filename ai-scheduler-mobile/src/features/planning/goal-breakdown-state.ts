import type { GoalBreakdownResult } from './types';

export type GoalBreakdownFeedback = {
  kind: 'error' | 'info' | 'success';
  message: string;
};

type ErrorShape = {
  details?: unknown;
  message?: unknown;
  status?: unknown;
};

export const goalBreakdownErrorCode = (value: unknown) => {
  const error = (value ?? {}) as ErrorShape;
  if (!error.details || typeof error.details !== 'object') return undefined;
  const response = error.details as { details?: { code?: unknown } };
  return typeof response.details?.code === 'string'
    ? response.details.code
    : undefined;
};

export const goalBreakdownErrorFeedback = (
  value: unknown,
): GoalBreakdownFeedback => {
  const error = (value ?? {}) as ErrorShape;
  const code = goalBreakdownErrorCode(error);
  if (error.status === 401) {
    return { kind: 'error', message: 'Session expired. Sign in again.' };
  }
  if (code === 'REQUEST_IN_PROGRESS') {
    return { kind: 'info', message: 'AI breakdown is still running. Retry shortly.' };
  }
  if (code === 'IDEMPOTENCY_CONFLICT') {
    return { kind: 'error', message: 'Goal changed. Start a fresh breakdown.' };
  }
  if (error.status === 409) {
    return { kind: 'info', message: 'Breakdown request conflicted. Retry shortly.' };
  }
  if (error.status === 422) {
    return { kind: 'error', message: 'AI returned an invalid task plan. Retry.' };
  }
  if (error.status === 502) {
    return { kind: 'error', message: 'AI service is unavailable. Retry shortly.' };
  }
  if (code === 'TASK_PERSISTENCE_ERROR') {
    return { kind: 'error', message: 'Tasks could not be saved. Retry safely.' };
  }
  if (error.status === 0) {
    return { kind: 'error', message: 'Network unavailable. Check your connection.' };
  }
  return {
    kind: 'error',
    message: typeof error.message === 'string' ? error.message : 'Breakdown failed.',
  };
};

export const goalBreakdownSuccessFeedback = (
  result: GoalBreakdownResult,
): GoalBreakdownFeedback => ({
  kind: 'success',
  message: result.replayed
    ? `${result.tasks.length} generated tasks restored.`
    : `${result.tasks.length} tasks generated.`,
});
