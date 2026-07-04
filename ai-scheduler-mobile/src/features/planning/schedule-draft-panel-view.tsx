import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ScheduleDraftBlocks } from './schedule-draft-blocks';
import type { ScheduleBlockEditInput, ScheduleDraft } from './types';

export type ScheduleDraftPanelViewProps = {
  busy: boolean;
  date: string;
  draft?: ScheduleDraft;
  errorMessage?: string;
  isLoading: boolean;
  noDraft: boolean;
  onApprove: (id: string) => void;
  onEdit: (
    draftId: string,
    blockId: string,
    body: ScheduleBlockEditInput,
  ) => void;
  onGenerate: () => void;
  onReject: (id: string) => void;
  timezone?: string;
};

export function ScheduleDraftPanelView({
  busy,
  date,
  draft,
  errorMessage,
  isLoading,
  noDraft,
  onApprove,
  onEdit,
  onGenerate,
  onReject,
  timezone,
}: ScheduleDraftPanelViewProps) {
  const canGenerate =
    noDraft || draft?.status === 'rejected' || draft?.status === 'expired';
  const canReview = draft?.status === 'draft';

  return (
    <ThemedView type="backgroundElement" style={styles.section}>
      <ThemedText type="smallBold">Today&apos;s schedule draft</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">{date}</ThemedText>
      {isLoading && <ThemedText type="small">Loading draft...</ThemedText>}
      {errorMessage && <ThemedText type="small">Failed: {errorMessage}</ThemedText>}
      {(noDraft || canGenerate) && (
        <ActionButton
          disabled={busy}
          label={draft ? 'Generate fresh draft' : 'Generate draft'}
          onPress={onGenerate}
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
      {canReview && (
        <ThemedView style={styles.actions}>
          <ActionButton
            disabled={busy}
            label="Approve and sync"
            onPress={() => onApprove(draft._id)}
          />
          <ActionButton
            disabled={busy}
            label="Reject"
            onPress={() => onReject(draft._id)}
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
  return (
    <ThemedView style={styles.blockList}>
      <ThemedText type="small" themeColor="textSecondary">
        {draft.status.toUpperCase()} - {draft.summary ?? 'No summary'}
      </ThemedText>
      {draft.warnings.map((warning) => (
        <ThemedText key={warning} type="small">Warning: {warning}</ThemedText>
      ))}
      <ScheduleDraftBlocks
        busy={busy}
        draft={draft}
        onEdit={onEdit}
        timezone={timezone}
      />
    </ThemedView>
  );
}

type ActionButtonProps = { disabled: boolean; label: string; onPress: () => void };

function ActionButton({ disabled, label, onPress }: ActionButtonProps) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={styles.button}>
      <ThemedText type="smallBold">{disabled ? 'Working...' : label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: Spacing.two },
  blockList: { backgroundColor: 'transparent', gap: Spacing.two },
  button: { alignSelf: 'flex-start', backgroundColor: '#DCEBFF', borderRadius: 8, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  section: { borderRadius: Spacing.two, gap: Spacing.two, padding: Spacing.three },
});
