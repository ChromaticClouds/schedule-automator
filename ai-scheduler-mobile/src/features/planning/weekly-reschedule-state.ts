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
  if (code === 'REQUEST_IN_PROGRESS') return '주간 재배치를 이미 실행 중입니다.';
  if (code === 'IDEMPOTENCY_CONFLICT') return '계획 컨텍스트가 변경되었습니다. 다시 시도하세요.';
  if (code === 'REPLAN_PROVIDER_ERROR') return '계획 생성 서비스를 사용할 수 없습니다.';
  if (code === 'REPLAN_SCHEMA_ERROR') return '생성된 계획 형식이 올바르지 않습니다.';
  if (code === 'REPLAN_VALIDATION_ERROR') return '생성된 계획을 안전하게 사용할 수 없습니다.';
  if (code === 'REPLAN_PERSISTENCE_ERROR') return '생성된 계획을 저장하지 못했습니다. 다시 시도하세요.';
  if (code === 'GOOGLE_RECONNECT_REQUIRED') return 'Google Calendar 연결이 만료되었습니다. 다시 연결하세요.';
  return isRecord(error) && typeof error.message === 'string'
    ? error.message
    : undefined;
};

export const weeklyRescheduleResultSummary = (
  result: WeeklyRescheduleResult,
) => `배치 ${result.placedTaskIds.length}개 / 보류 ${result.overflowTaskIds.length}개`;
