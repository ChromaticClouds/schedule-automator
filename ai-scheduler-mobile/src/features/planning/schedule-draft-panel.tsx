import * as Crypto from 'expo-crypto';

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
import {
  scheduleDraftErrorMessage,
  scheduleDraftIsNotFoundError,
} from './schedule-draft-state';

export function ScheduleDraftPanel() {
  const date = toScheduleDateKey();
  const draftQuery = useScheduleDraft(date);
  const preferences = useSchedulePreferences();
  const generateDraft = useGenerateScheduleDraft(date);
  const approveDraft = useApproveScheduleDraft(date);
  const rejectDraft = useRejectScheduleDraft(date);
  const editBlock = useEditScheduleBlock(date);
  const errorMessage =
    scheduleDraftErrorMessage(draftQuery.error, true) ??
    scheduleDraftErrorMessage(generateDraft.error) ??
    scheduleDraftErrorMessage(approveDraft.error) ??
    scheduleDraftErrorMessage(rejectDraft.error) ??
    scheduleDraftErrorMessage(editBlock.error);
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
    noDraft: scheduleDraftIsNotFoundError(draftQuery.error),
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
