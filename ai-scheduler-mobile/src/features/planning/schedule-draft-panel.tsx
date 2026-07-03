import * as Crypto from 'expo-crypto';
import { Pressable, StyleSheet } from 'react-native';

import { ApiError } from '@/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  useApproveScheduleDraft,
  useGenerateScheduleDraft,
  useRejectScheduleDraft,
  useScheduleDraft,
} from './hooks';
import type { ScheduleBlock, ScheduleDraft } from './types';

const toDateKey = (date = new Date()) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

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

const draftErrorMessage = (error: Error | null) => {
  const code = detailCode(error);
  if (code === 'REQUEST_IN_PROGRESS') return 'Draft generation is already running.';
  if (code === 'STALE_DRAFT_CONTEXT') return 'Calendar changed. Generate a fresh draft.';
  if (code === 'INVALID_DRAFT_STATE') return 'Draft state changed. Refresh and try again.';
  if (error instanceof ApiError && error.status === 404) return undefined;
  return error?.message;
};

export function ScheduleDraftPanel() {
  const date = toDateKey();
  const draftQuery = useScheduleDraft(date);
  const generateDraft = useGenerateScheduleDraft(date);
  const approveDraft = useApproveScheduleDraft(date);
  const rejectDraft = useRejectScheduleDraft(date);
  const draft = draftQuery.data;
  const noDraft = draftQuery.error instanceof ApiError && draftQuery.error.status === 404;
  const busy =
    generateDraft.isPending || approveDraft.isPending || rejectDraft.isPending;
  const canGenerate =
    noDraft || draft?.status === 'rejected' || draft?.status === 'expired';
  const canReview = draft?.status === 'draft';
  const errorMessage =
    draftErrorMessage(draftQuery.error) ??
    draftErrorMessage(generateDraft.error) ??
    draftErrorMessage(approveDraft.error) ??
    draftErrorMessage(rejectDraft.error);

  const submitGenerate = () => {
    generateDraft.mutate(`schedule-draft:${date}:${Crypto.randomUUID()}`);
  };

  return (
    <ThemedView type="backgroundElement" style={styles.section}>
      <ThemedText type="smallBold">Today&apos;s schedule draft</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">{date}</ThemedText>
      {draftQuery.isLoading && <ThemedText type="small">Loading draft...</ThemedText>}
      {errorMessage && <ThemedText type="small">Failed: {errorMessage}</ThemedText>}
      {(noDraft || canGenerate) && (
        <ActionButton
          disabled={busy}
          label={draft ? 'Generate fresh draft' : 'Generate draft'}
          onPress={submitGenerate}
        />
      )}
      {draft && <DraftSummary draft={draft} />}
      {canReview && (
        <ThemedView style={styles.actions}>
          <ActionButton
            disabled={busy}
            label="Approve and sync"
            onPress={() => approveDraft.mutate(draft._id)}
          />
          <ActionButton
            disabled={busy}
            label="Reject"
            onPress={() => rejectDraft.mutate(draft._id)}
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
