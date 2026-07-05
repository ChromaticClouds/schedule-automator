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
    return { kind: 'error', message: '세션이 만료되었습니다. 다시 로그인하세요.' };
  }
  if (code === 'REQUEST_IN_PROGRESS') {
    return { kind: 'info', message: 'AI 작업 분해가 아직 진행 중입니다. 잠시 후 다시 시도하세요.' };
  }
  if (code === 'IDEMPOTENCY_CONFLICT') {
    return { kind: 'error', message: '목표가 변경되었습니다. 새 작업 분해를 시작하세요.' };
  }
  if (error.status === 409) {
    return { kind: 'info', message: '작업 분해 요청이 충돌했습니다. 잠시 후 다시 시도하세요.' };
  }
  if (error.status === 422) {
    return { kind: 'error', message: 'AI가 올바르지 않은 작업 계획을 반환했습니다. 다시 시도하세요.' };
  }
  if (error.status === 502) {
    return { kind: 'error', message: 'AI 서비스를 사용할 수 없습니다. 잠시 후 다시 시도하세요.' };
  }
  if (code === 'TASK_PERSISTENCE_ERROR') {
    return { kind: 'error', message: '작업을 저장하지 못했습니다. 안전하게 다시 시도하세요.' };
  }
  if (error.status === 0) {
    return { kind: 'error', message: '네트워크를 사용할 수 없습니다. 연결 상태를 확인하세요.' };
  }
  return {
    kind: 'error',
    message: typeof error.message === 'string' ? error.message : '작업 분해에 실패했습니다.',
  };
};

export const goalBreakdownSuccessFeedback = (
  result: GoalBreakdownResult,
): GoalBreakdownFeedback => ({
  kind: 'success',
  message: result.replayed
    ? `생성된 작업 ${result.tasks.length}개를 복구했습니다.`
    : `작업 ${result.tasks.length}개를 생성했습니다.`,
});
