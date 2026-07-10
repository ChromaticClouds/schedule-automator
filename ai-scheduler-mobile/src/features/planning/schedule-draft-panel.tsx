import * as Crypto from 'expo-crypto';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from '@/components/toast-provider';
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
import { useScheduleDraftComposerStore } from './schedule-draft-composer-state';

export function ScheduleDraftPanel() {
  const { showToast } = useToast();
  const date = toScheduleDateKey();
  const clearInstruction = useScheduleDraftComposerStore(
    (state) => state.clearInstruction,
  );
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
  const toastError = (error: unknown, fallback: string) =>
    showToast({
      kind: 'error',
      message: scheduleDraftErrorMessage(error) ?? fallback,
    });
  const toastSuccess = (message: string) =>
    showToast({ kind: 'success', message });
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
    onApprove: (id) =>
      approveDraft.mutate(id, {
        onError: (error) => toastError(error, '초안을 승인하지 못했습니다.'),
        onSuccess: () => toastSuccess('초안을 승인했습니다.'),
      }),
    onEdit: (draftId, blockId, body) =>
      editBlock.mutate(
        { blockId, body, draftId },
        {
          onError: (error) => toastError(error, '블록을 수정하지 못했습니다.'),
          onSuccess: () => toastSuccess('일정 블록을 수정했습니다.'),
        },
      ),
    onGenerate: (instruction) =>
      generateDraft.mutate({
        idempotencyKey: `schedule-draft:${date}:${Crypto.randomUUID()}`,
        instruction,
      }, {
        onError: (error) => toastError(error, '초안을 생성하지 못했습니다.'),
        onSuccess: () => {
          clearInstruction(date);
          toastSuccess('초안을 생성했습니다.');
        },
      }),
    onReconnect: () =>
      reconnectGoogle.mutate(undefined, {
        onError: () =>
          showToast({ kind: 'error', message: 'Google 재연결을 완료하지 못했습니다.' }),
        onSuccess: (connected) => {
          if (connected) {
            toastSuccess('Google Calendar를 다시 연결했습니다.');
          }
        },
      }),
    onRegenerate: (draftId) =>
      regenerateDraft.mutate(
        {
          draftId,
          idempotencyKey: `schedule-regenerate:${draftId}:${Crypto.randomUUID()}`,
        },
        {
          onError: (error) => toastError(error, '초안을 다시 생성하지 못했습니다.'),
          onSuccess: () => toastSuccess('초안을 다시 생성했습니다.'),
        },
      ),
    onReject: (id) =>
      rejectDraft.mutate(id, {
        onError: (error) => toastError(error, '초안을 거절하지 못했습니다.'),
        onSuccess: () => toastSuccess('초안을 거절했습니다.'),
      }),
    timezone: preferences.data?.timezone,
  };
  return <ScheduleDraftPanelView {...props} />;
}
