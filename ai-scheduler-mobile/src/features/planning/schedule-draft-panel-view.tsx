import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { PlanningButton } from './planning-controls';
import { ScheduleDraftBlocks } from './schedule-draft-blocks';
import { ScheduleDraftRecoveryActionButton } from './schedule-draft-recovery-action';
import {
  canReviewScheduleDraft,
  scheduleDraftRecoveryAction,
  scheduleDraftCalendarEventSummary,
  scheduleDraftStatusMessage,
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
    <ThemedView type="backgroundElement" style={styles.section}>
      <ThemedText type="smallBold">Today&apos;s schedule draft</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">{date}</ThemedText>
      {isLoading && <ThemedText type="small">Loading draft...</ThemedText>}
      {errorMessage && <ThemedText type="small">Failed: {errorMessage}</ThemedText>}
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
      {draft && (
        <DraftSummary
          busy={busy}
          draft={draft}
          onEdit={onEdit}
          timezone={timezone}
        />
      )}
      {reviewDraft && (
        <ThemedView style={styles.actions}>
          <ActionButton
            disabled={busy}
            label="Approve and sync"
            onPress={() => onApprove(reviewDraft._id)}
          />
          <ActionButton
            disabled={busy}
            label="Reject"
            onPress={() => onReject(reviewDraft._id)}
          />
        </ThemedView>
      )}
    </ThemedView>
  );
}

function DraftSummary({
  busy,
  draft,
  onEdit,
  timezone,
}: {
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
        {draft.status.toUpperCase()} - {draft.summary ?? 'No summary'}
      </ThemedText>
      {statusMessage && <ThemedText type="small">{statusMessage}</ThemedText>}
      {calendarSummary && (
        <ThemedText type="small" themeColor="textSecondary">{calendarSummary}</ThemedText>
      )}
      {draft.warnings.map((warning) => (
        <ThemedText key={warning} type="small">Warning: {warning}</ThemedText>
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
      label={disabled ? 'Working...' : label}
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
