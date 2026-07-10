import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { PlanningButton } from './planning-controls';
import { ScheduleDraftRecoveryActionButton } from './schedule-draft-recovery-action';
import { ScheduleDraftSummary } from './schedule-draft-summary';
import {
  canReviewScheduleDraft,
  scheduleDraftRecoveryAction,
} from './schedule-draft-state';
import type { ScheduleBlockEditInput, ScheduleDraft } from './types';
export type ScheduleDraftPanelViewProps = {
  busy: boolean;
  date: string;
  draft?: ScheduleDraft;
  errorCode?: string;
  errorMessage?: string;
  hideGenerateRecovery?: boolean;
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
  hideGenerateRecovery = false,
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
    <View style={styles.content}>
      <ThemedText type="smallBold">오늘의 일정 초안</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">{date}</ThemedText>
      {isLoading && <ThemedText type="small">초안을 불러오는 중...</ThemedText>}
      {busy && !isLoading && (
        <ThemedText accessibilityLiveRegion="polite" type="small">
          요청을 처리하는 중입니다...
        </ThemedText>
      )}
      {errorMessage && (
        <ThemedText type="small" themeColor="danger">
          실패: {errorMessage}
        </ThemedText>
      )}
      {recoveryAction && !(hideGenerateRecovery && recoveryAction.kind === 'generate') && (
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
        <View style={styles.actions}>
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
        </View>
      )}
    </View>
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
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  button: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  content: { gap: Spacing.two },
});
