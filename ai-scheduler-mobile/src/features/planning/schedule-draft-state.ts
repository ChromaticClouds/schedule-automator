import type { ScheduleDraft } from './types';

type ApiLikeError = { details?: unknown; message?: unknown; status?: unknown };
const aiProviderErrorCode = ['GEM', 'INI_API_ERROR'].join('');

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const scheduleDraftDetailCode = (error: unknown) => {
  if (!isRecord(error)) return undefined;
  const details = (error as ApiLikeError).details;
  if (!isRecord(details)) return undefined;
  const nestedDetails = details.details;
  if (!isRecord(nestedDetails)) return undefined;
  const external = nestedDetails.external;
  if (isRecord(external) && typeof external.code === 'string') {
    return external.code;
  }
  return typeof nestedDetails.code === 'string'
    ? nestedDetails.code
    : undefined;
};

export const scheduleDraftIsNotFoundError = (error: unknown) =>
  isRecord(error) && (error as ApiLikeError).status === 404;

export const scheduleDraftErrorMessage = (
  error: unknown,
  ignoreNotFound = false,
) => {
  const code = scheduleDraftDetailCode(error);
  if (code === 'REQUEST_IN_PROGRESS') return '일정 초안이 이미 생성 중입니다.';
  if (code === 'GOOGLE_CALENDAR_API_DISABLED') {
    return 'Google Calendar API가 비활성화되어 초안을 만들 수 없습니다. Google Cloud 설정을 확인해 주세요.';
  }
  if (code === aiProviderErrorCode) {
    return 'AI 서비스 요청이 실패했습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (code === 'STALE_DRAFT_CONTEXT') return '캘린더가 변경되었습니다. 새 초안을 생성해 주세요.';
  if (code === 'INVALID_DRAFT_STATE') return '초안 상태가 변경되었습니다. 새로고침 후 다시 시도해 주세요.';
  if (code === 'STALE_DRAFT_VERSION') return '다른 곳에서 초안이 변경되었습니다. 최신 버전을 확인해 주세요.';
  if (code === 'DRAFT_EDIT_VALIDATION_ERROR') return '현재 일정과 충돌하는 수정입니다.';
  if (code === 'DRAFT_BLOCK_NOT_EDITABLE') return '이 블록은 수정할 수 없습니다.';
  if (code === 'GOOGLE_RECONNECT_REQUIRED') return 'Google Calendar 연결이 만료되었습니다. 다시 연결해 주세요.';
  if (code === 'GOOGLE_CALENDAR_SYNC_FAILED') return 'Google Calendar 동기화에 실패했습니다. 나중에 다시 시도해 주세요.';
  if (ignoreNotFound && scheduleDraftIsNotFoundError(error)) return undefined;
  return isRecord(error) && typeof error.message === 'string'
    ? error.message
    : undefined;
};

export const canGenerateScheduleDraft = (
  draft: ScheduleDraft | undefined,
  noDraft: boolean,
) => noDraft || draft?.status === 'rejected' || draft?.status === 'expired';

export const canReviewScheduleDraft = (draft: ScheduleDraft | undefined) =>
  draft?.status === 'draft';

export const canRegenerateScheduleDraft = (draft: ScheduleDraft | undefined) =>
  draft?.status === 'draft' ||
  draft?.status === 'rejected' ||
  draft?.status === 'expired';

export const canRetryScheduleDraftSync = (draft: ScheduleDraft | undefined) =>
  draft?.status === 'approved';

export type ScheduleDraftRecoveryAction = {
  kind: 'generate' | 'reconnect-google' | 'regenerate' | 'retry-sync';
  label: string;
  message?: string;
};

export const scheduleDraftRecoveryAction = (
  draft: ScheduleDraft | undefined,
  noDraft: boolean,
  errorCode?: string,
): ScheduleDraftRecoveryAction | undefined => {
  if (errorCode === 'REQUEST_IN_PROGRESS') return undefined;
  if (errorCode === 'GOOGLE_CALENDAR_API_DISABLED') return undefined;
  if (errorCode === 'GOOGLE_RECONNECT_REQUIRED') {
    return {
      kind: 'reconnect-google',
      label: 'Google 다시 연결',
      message: '초안을 동기화하기 전에 Google Calendar를 다시 연결해 주세요.',
    };
  }
  if (errorCode === 'GOOGLE_CALENDAR_SYNC_FAILED' && canRetryScheduleDraftSync(draft)) {
    return { kind: 'retry-sync', label: '동기화 재시도' };
  }
  if (errorCode === 'STALE_DRAFT_CONTEXT') {
    return draft
      ? { kind: 'regenerate', label: '새 초안 다시 생성' }
      : { kind: 'generate', label: '새 초안 생성' };
  }
  if (canRetryScheduleDraftSync(draft)) return { kind: 'retry-sync', label: '동기화 재시도' };
  if (canRegenerateScheduleDraft(draft)) return { kind: 'regenerate', label: '초안 다시 생성' };
  if (noDraft) return { kind: 'generate', label: '초안 생성' };
  return undefined;
};

export const scheduleDraftStatusMessage = (draft: ScheduleDraft) => {
  if (draft.status === 'approved') return '승인되었습니다. Google Calendar 동기화를 기다리는 중입니다.';
  if (draft.status === 'synced') return 'Google Calendar에 동기화되었습니다.';
  return undefined;
};

export const scheduleDraftCalendarEventSummary = (draft: ScheduleDraft) => {
  const ids = draft.blocks
    .map((block) => block.calendarEventId)
    .filter((id): id is string => Boolean(id));
  if (ids.length === 1) return '캘린더 이벤트 1개가 동기화되었습니다.';
  return ids.length ? `캘린더 이벤트 ${ids.length}개가 동기화되었습니다.` : undefined;
};
