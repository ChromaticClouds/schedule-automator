import * as Crypto from 'expo-crypto';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { signInWithGoogle } from '@/features/auth/oauth';
import { useSchedulePreferences } from '@/features/settings/hooks';
import {
  ScheduleDraftPanelView,
  type ScheduleDraftPanelViewProps,
} from './schedule-draft-panel-view';
import {
  planningKeys,
  useApproveScheduleDraft,
  useGenerateScheduleDraft,
  useRejectScheduleDraft,
  useScheduleDraft,
} from './hooks';
import { useEditScheduleBlock } from './schedule-edit-hooks';
import { toScheduleDateKey } from './schedule-date';
import {
  scheduleDraftDetailCode,
  scheduleDraftErrorMessage,
  scheduleDraftIsNotFoundError,
} from './schedule-draft-state';
import { useRegenerateScheduleDraft } from './schedule-regenerate-hooks';

export function ScheduleDraftPanel() {
  const date = toScheduleDateKey();
  const queryClient = useQueryClient();
  const draftQuery = useScheduleDraft(date);
  const preferences = useSchedulePreferences();
  const generateDraft = useGenerateScheduleDraft(date);
  const approveDraft = useApproveScheduleDraft(date);
  const rejectDraft = useRejectScheduleDraft(date);
  const regenerateDraft = useRegenerateScheduleDraft(date);
  const editBlock = useEditScheduleBlock(date);
  const reconnectGoogle = useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: (connected) => {
      if (!connected) return;
      approveDraft.reset();
      editBlock.reset();
      generateDraft.reset();
      regenerateDraft.reset();
      rejectDraft.reset();
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: planningKeys.scheduleDraft(date),
      }),
  });
  const recoveryCode =
    scheduleDraftDetailCode(draftQuery.error) ??
    scheduleDraftDetailCode(generateDraft.error) ??
    scheduleDraftDetailCode(approveDraft.error) ??
    scheduleDraftDetailCode(rejectDraft.error) ??
    scheduleDraftDetailCode(regenerateDraft.error) ??
    scheduleDraftDetailCode(editBlock.error);
  const errorMessage =
    scheduleDraftErrorMessage(draftQuery.error, true) ??
    scheduleDraftErrorMessage(generateDraft.error) ??
    scheduleDraftErrorMessage(approveDraft.error) ??
    scheduleDraftErrorMessage(rejectDraft.error) ??
    scheduleDraftErrorMessage(regenerateDraft.error) ??
    scheduleDraftErrorMessage(editBlock.error) ??
    scheduleDraftErrorMessage(reconnectGoogle.error);
  const props: ScheduleDraftPanelViewProps = {
    busy:
      generateDraft.isPending ||
      approveDraft.isPending ||
      rejectDraft.isPending ||
      regenerateDraft.isPending ||
      editBlock.isPending ||
      reconnectGoogle.isPending,
    date,
    draft: draftQuery.data,
    errorCode: recoveryCode,
    errorMessage,
    isLoading: draftQuery.isLoading,
    noDraft: scheduleDraftIsNotFoundError(draftQuery.error),
    onApprove: (id) => approveDraft.mutate(id),
    onEdit: (draftId, blockId, body) =>
      editBlock.mutate({ blockId, body, draftId }),
    onGenerate: () =>
      generateDraft.mutate(`schedule-draft:${date}:${Crypto.randomUUID()}`),
    onReconnect: () => reconnectGoogle.mutate(),
    onRegenerate: (draftId) =>
      regenerateDraft.mutate({
        draftId,
        idempotencyKey: `schedule-regenerate:${draftId}:${Crypto.randomUUID()}`,
      }),
    onReject: (id) => rejectDraft.mutate(id),
    timezone: preferences.data?.timezone,
  };
  return <ScheduleDraftPanelView {...props} />;
}
