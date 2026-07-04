import * as Crypto from 'expo-crypto';

import { ApiError } from '@/api';
import { useSchedulePreferences } from '@/features/settings/hooks';
import {
  ScheduleDraftPanelView,
  type ScheduleDraftPanelViewProps,
} from './schedule-draft-panel-view';
import {
  useApproveScheduleDraft,
  useGenerateScheduleDraft,
  useRejectScheduleDraft,
  useScheduleDraft,
} from './hooks';
import { useEditScheduleBlock } from './schedule-edit-hooks';
import { toScheduleDateKey } from './schedule-date';

const detailCode = (error: unknown) => {
  if (
    !(error instanceof ApiError) ||
    error.details === null ||
    typeof error.details !== 'object'
  ) {
    return undefined;
  }
  const details = error.details as { details?: { code?: unknown } };
  return typeof details.details?.code === 'string'
    ? details.details.code
    : undefined;
};

const draftErrorMessage = (error: Error | null, ignoreNotFound = false) => {
  const code = detailCode(error);
  if (code === 'REQUEST_IN_PROGRESS') return 'Draft generation is already running.';
  if (code === 'STALE_DRAFT_CONTEXT') return 'Calendar changed. Generate a fresh draft.';
  if (code === 'INVALID_DRAFT_STATE') return 'Draft state changed. Refresh and try again.';
  if (code === 'STALE_DRAFT_VERSION') return 'Draft changed elsewhere. Review the latest version.';
  if (code === 'DRAFT_EDIT_VALIDATION_ERROR') return 'Edit conflicts with the current schedule.';
  if (code === 'DRAFT_BLOCK_NOT_EDITABLE') return 'This block cannot be edited.';
  if (ignoreNotFound && error instanceof ApiError && error.status === 404) return undefined;
  return error?.message;
};

export function ScheduleDraftPanel() {
  const date = toScheduleDateKey();
  const draftQuery = useScheduleDraft(date);
  const preferences = useSchedulePreferences();
  const generateDraft = useGenerateScheduleDraft(date);
  const approveDraft = useApproveScheduleDraft(date);
  const rejectDraft = useRejectScheduleDraft(date);
  const editBlock = useEditScheduleBlock(date);
  const errorMessage =
    draftErrorMessage(draftQuery.error, true) ??
    draftErrorMessage(generateDraft.error) ??
    draftErrorMessage(approveDraft.error) ??
    draftErrorMessage(rejectDraft.error) ??
    draftErrorMessage(editBlock.error);
  const props: ScheduleDraftPanelViewProps = {
    busy:
      generateDraft.isPending ||
      approveDraft.isPending ||
      rejectDraft.isPending ||
      editBlock.isPending,
    date,
    draft: draftQuery.data,
    errorMessage,
    isLoading: draftQuery.isLoading,
    noDraft: draftQuery.error instanceof ApiError && draftQuery.error.status === 404,
    onApprove: (id) => approveDraft.mutate(id),
    onEdit: (draftId, blockId, body) =>
      editBlock.mutate({ blockId, body, draftId }),
    onGenerate: () =>
      generateDraft.mutate(`schedule-draft:${date}:${Crypto.randomUUID()}`),
    onReject: (id) => rejectDraft.mutate(id),
    timezone: preferences.data?.timezone,
  };
  return <ScheduleDraftPanelView {...props} />;
}
