import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card, CardContent } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { PlanningButton } from './planning-controls';
import { ScheduleDraftComposer } from './schedule-draft-composer';
import { ScheduleDraftRecoveryActionButton } from './schedule-draft-recovery-action';
import { ScheduleDraftSummary } from './schedule-draft-summary';
import {
  canReviewScheduleDraft,
  canGenerateScheduleDraft,
  scheduleDraftRecoveryAction,
} from './schedule-draft-state';
import type { ScheduleBlockEditInput, ScheduleDraft } from './types';
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
  onGenerate: (instruction?: string) => void;
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
  const showComposer =
    canGenerateScheduleDraft(draft, noDraft) &&
    recoveryAction?.kind !== 'reconnect-google';
  return (
    <Card className="gap-0 py-0">
      <CardContent className="gap-4 px-4 py-4">
      <ThemedText type="smallBold">오늘의 일정 초안</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">{date}</ThemedText>
      {isLoading && <ThemedText type="small">초안을 불러오는 중...</ThemedText>}
      {errorMessage && (
        <ThemedText type="small" themeColor="danger">
          실패: {errorMessage}
        </ThemedText>
      )}
      {showComposer && (
        <ScheduleDraftComposer busy={busy} date={date} onGenerate={onGenerate} />
      )}
      {recoveryAction && (!showComposer || recoveryAction.kind !== 'generate') && (
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
      {draft && <ScheduleDraftSummary busy={busy} draft={draft} onEdit={onEdit} timezone={timezone} />}
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
      </CardContent>
    </Card>
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
  button: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
});
