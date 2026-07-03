import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { ScheduleBlock, ScheduleDraft } from './types';

export type ScheduleDraftPanelViewProps = {
  busy: boolean;
  date: string;
  draft?: ScheduleDraft;
  errorMessage?: string;
  isLoading: boolean;
  noDraft: boolean;
  onApprove: (id: string) => void;
  onGenerate: () => void;
  onReject: (id: string) => void;
};

export function ScheduleDraftPanelView({
  busy,
  date,
  draft,
  errorMessage,
  isLoading,
  noDraft,
  onApprove,
  onGenerate,
  onReject,
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
      {draft && <DraftSummary draft={draft} />}
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

function DraftSummary({ draft }: { draft: ScheduleDraft }) {
  return (
    <ThemedView style={styles.blockList}>
      <ThemedText type="small" themeColor="textSecondary">
        {draft.status.toUpperCase()} - {draft.summary ?? 'No summary'}
      </ThemedText>
      {draft.warnings.map((warning) => (
        <ThemedText key={warning} type="small">Warning: {warning}</ThemedText>
      ))}
      {draft.blocks.map((block) => <DraftBlock key={block._id} block={block} />)}
    </ThemedView>
  );
}

function DraftBlock({ block }: { block: ScheduleBlock }) {
  return (
    <ThemedView style={styles.block}>
      <ThemedText type="smallBold">{block.title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {formatTime(block.start)}-{formatTime(block.end)} - {block.type}
      </ThemedText>
      {block.reason && <ThemedText type="small">{block.reason}</ThemedText>}
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

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: Spacing.two },
  block: { backgroundColor: 'transparent', gap: Spacing.one },
  blockList: { backgroundColor: 'transparent', gap: Spacing.two },
  button: { alignSelf: 'flex-start', backgroundColor: '#DCEBFF', borderRadius: 8, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  section: { borderRadius: Spacing.two, gap: Spacing.two, padding: Spacing.three },
});
