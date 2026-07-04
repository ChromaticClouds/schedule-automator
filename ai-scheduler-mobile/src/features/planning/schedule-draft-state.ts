import type { ScheduleDraft } from './types';

type ApiLikeError = {
  details?: unknown;
  message?: unknown;
  status?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const scheduleDraftDetailCode = (error: unknown) => {
  if (!isRecord(error)) return undefined;

  const details = (error as ApiLikeError).details;
  if (!isRecord(details)) return undefined;

  const nestedDetails = details.details;
  if (!isRecord(nestedDetails)) return undefined;

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
  if (code === 'REQUEST_IN_PROGRESS') return 'Draft generation is already running.';
  if (code === 'STALE_DRAFT_CONTEXT') return 'Calendar changed. Generate a fresh draft.';
  if (code === 'INVALID_DRAFT_STATE') return 'Draft state changed. Refresh and try again.';
  if (code === 'STALE_DRAFT_VERSION') return 'Draft changed elsewhere. Review the latest version.';
  if (code === 'DRAFT_EDIT_VALIDATION_ERROR') return 'Edit conflicts with the current schedule.';
  if (code === 'DRAFT_BLOCK_NOT_EDITABLE') return 'This block cannot be edited.';
  if (code === 'GOOGLE_RECONNECT_REQUIRED') return 'Google Calendar connection expired. Reconnect Google.';
  if (code === 'GOOGLE_CALENDAR_SYNC_FAILED') return 'Google Calendar sync failed. Try again later.';
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
  if (errorCode === 'GOOGLE_RECONNECT_REQUIRED') {
    return {
      kind: 'reconnect-google',
      label: 'Reconnect Google',
      message: 'Reconnect Google Calendar before syncing this draft.',
    };
  }
  if (errorCode === 'GOOGLE_CALENDAR_SYNC_FAILED' && canRetryScheduleDraftSync(draft)) {
    return { kind: 'retry-sync', label: 'Retry sync' };
  }
  if (errorCode === 'STALE_DRAFT_CONTEXT') {
    return draft
      ? { kind: 'regenerate', label: 'Regenerate fresh draft' }
      : { kind: 'generate', label: 'Generate fresh draft' };
  }
  if (canRetryScheduleDraftSync(draft)) return { kind: 'retry-sync', label: 'Retry sync' };
  if (canRegenerateScheduleDraft(draft)) return { kind: 'regenerate', label: 'Regenerate draft' };
  if (noDraft) return { kind: 'generate', label: 'Generate draft' };
  return undefined;
};

export const scheduleDraftStatusMessage = (draft: ScheduleDraft) => {
  if (draft.status === 'approved') return 'Approved. Google Calendar sync is pending.';
  if (draft.status === 'synced') return 'Google Calendar synced.';
  return undefined;
};

export const scheduleDraftCalendarEventSummary = (draft: ScheduleDraft) => {
  const ids = draft.blocks
    .map((block) => block.calendarEventId)
    .filter((id): id is string => Boolean(id));
  if (ids.length === 1) return '1 calendar event synced.';
  return ids.length ? `${ids.length} calendar events synced.` : undefined;
};
