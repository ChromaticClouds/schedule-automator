import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { PlanningButton } from './planning-controls';
import { ScheduleDraftBlocks } from './schedule-draft-blocks';
import { ScheduleDraftRecoveryActionButton } from './schedule-draft-recovery-action';
import {
  canReviewScheduleDraft,
  scheduleDraftCalendarEventSummary,
  scheduleDraftRecoveryAction,
  scheduleDraftStatusMessage,
} from './schedule-draft-state';
import type { ScheduleBlockEditInput, ScheduleDraft } from './types';

const draftStatusLabels: Record<ScheduleDraft['status'], string> = {
  approved: '승인됨',
  draft: '초안',
  expired: '만료됨',
  rejected: '거절됨',
  synced: '동기화됨',
};

export type ScheduleDraftPanelViewProps = {
  busy: boolean;
  date: string;
  draft?: ScheduleDraft;
  errorCode?: string;
  errorMessage?: string;
  isLoading: boolean;
  noDraft: boolean;
  onApprove: (id: string) => void;
  onEdit: (draftId: string, blockId: string, body: ScheduleBlockEditInput) => void;
  onGenerate: () => void;
  onReconnect: () => void;
  onRegenerate: (id: string) => void;
  onReject: (id: string) => void;
  timezone?: string;
};

export function ScheduleDraftPanelView({
  busy,
  date,
  draft,
  errorCode,
  errorMessage,
  isLoading,
  noDraft,
  onApprove,
  onEdit,
  onGenerate,
  onReconnect,
  onRegenerate,
  onReject,
  timezone,
}: ScheduleDraftPanelViewProps) {
  const recoveryAction = scheduleDraftRecoveryAction(draft, noDraft, errorCode);
  const reviewDraft = canReviewScheduleDraft(draft) ? draft : undefined;

  return (
    <ThemedView style={styles.section} type="backgroundElement">
      <ThemedText type="smallBold">오늘의 일정 초안</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">{date}</ThemedText>
      {isLoading && <ThemedText type="small">초안을 불러오는 중...</ThemedText>}
      {errorMessage && (
        <ThemedText type="small" themeColor="danger">
          실패: {errorMessage}
        </ThemedText>
      )}
      {recoveryAction && (
        <ScheduleDraftRecoveryActionButton
          action={recoveryAction}
          busy={busy}
          draft={draft}
          onApprove={onApprove}
          onGenerate={onGenerate}
          onReconnect={onReconnect}
          onRegenerate={onRegenerate}
        />
      )}
      {draft && <DraftSummary busy={busy} draft={draft} onEdit={onEdit} timezone={timezone} />}
      {reviewDraft && (
        <ThemedView style={styles.actions}>
          <ActionButton
            disabled={busy}
            label="승인하고 동기화"
            onPress={() => onApprove(reviewDraft._id)}
          />
          <ActionButton
            disabled={busy}
            label="거절"
            onPress={() => onReject(reviewDraft._id)}
          />
        </ThemedView>
      )}
    </ThemedView>
  );
}

function DraftSummary({ busy, draft, onEdit, timezone }: {
  busy: boolean;
  draft: ScheduleDraft;
  onEdit: ScheduleDraftPanelViewProps['onEdit'];
  timezone?: string;
}) {
  const statusMessage = scheduleDraftStatusMessage(draft);
  const calendarSummary = scheduleDraftCalendarEventSummary(draft);

  return (
    <ThemedView style={styles.blockList}>
      <ThemedText type="small" themeColor="textSecondary">
        {draftStatusLabels[draft.status]} - {draft.summary ?? '요약 없음'}
      </ThemedText>
      {statusMessage && <ThemedText type="small">{statusMessage}</ThemedText>}
      {calendarSummary && (
        <ThemedText type="small" themeColor="textSecondary">{calendarSummary}</ThemedText>
      )}
      {draft.warnings.map((warning) => (
        <ThemedText key={warning} type="small" themeColor="danger">
          주의: {warning}
        </ThemedText>
      ))}
      <ScheduleDraftBlocks busy={busy} draft={draft} onEdit={onEdit} timezone={timezone} />
    </ThemedView>
  );
}

type ActionButtonProps = { disabled: boolean; label: string; onPress: () => void };

function ActionButton({ disabled, label, onPress }: ActionButtonProps) {
  return (
    <PlanningButton
      disabled={disabled}
      label={disabled ? '처리 중...' : label}
      onPress={onPress}
      style={styles.button}
    />
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: Spacing.two },
  blockList: { backgroundColor: 'transparent', gap: Spacing.two },
  button: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  section: { borderRadius: Spacing.two, gap: Spacing.two, padding: Spacing.three },
});
