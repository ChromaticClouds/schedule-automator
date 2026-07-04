import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { WeeklyRescheduleResult } from './types';

export type WeeklyRescheduleViewProps = {
  disabled: boolean;
  errorMessage?: string;
  isPending: boolean;
  onRun: () => void;
  result?: WeeklyRescheduleResult;
  taskNames: Record<string, string>;
};

export function WeeklyRescheduleView({
  disabled,
  errorMessage,
  isPending,
  onRun,
  result,
  taskNames,
}: WeeklyRescheduleViewProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.panel}>
      <ThemedText type="smallBold">Weekly missed-task replan</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Place missed tasks into the remaining days of this week.
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        disabled={disabled || isPending}
        onPress={onRun}
        style={[styles.button, (disabled || isPending) && styles.disabled]}
      >
        <ThemedText type="smallBold">
          {isPending ? 'Rescheduling...' : 'Reschedule missed tasks'}
        </ThemedText>
      </Pressable>
      {disabled && !result && (
        <ThemedText type="small">No missed tasks are ready to replan.</ThemedText>
      )}
      {errorMessage && (
        <ThemedText type="small">Failed: {errorMessage}</ThemedText>
      )}
      {result && <ResultSummary result={result} taskNames={taskNames} />}
    </ThemedView>
  );
}

function ResultSummary({
  result,
  taskNames,
}: {
  result: WeeklyRescheduleResult;
  taskNames: Record<string, string>;
}) {
  if (result.replayed) {
    return <ThemedText type="small">This request was already processed.</ThemedText>;
  }
  return (
    <ThemedView style={styles.results}>
      <ThemedText type="smallBold">
        Placed {result.placedTaskIds.length} · Overflow {result.overflowTaskIds.length}
      </ThemedText>
      {result.drafts.map((draft) => (
        <ThemedView key={draft._id} style={styles.resultGroup}>
          <ThemedText type="smallBold">{draft.date}</ThemedText>
          {draft.blocks
            .filter(({ taskId }) => result.placedTaskIds.includes(taskId ?? ''))
            .map((block) => (
              <ThemedText key={block._id} type="small">
                {block.title} · {formatTime(block.start)}
              </ThemedText>
            ))}
        </ThemedView>
      ))}
      {result.overflowTaskIds.map((taskId) => (
        <ThemedText key={taskId} type="small">
          Overflow · {taskNames[taskId] ?? taskId}
        </ThemedText>
      ))}
    </ThemedView>
  );
}

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const styles = StyleSheet.create({
  button: { alignSelf: 'flex-start', backgroundColor: '#DCEBFF', borderRadius: 8, padding: Spacing.two },
  disabled: { opacity: 0.5 },
  panel: { borderRadius: Spacing.two, gap: Spacing.two, padding: Spacing.three },
  resultGroup: { backgroundColor: 'transparent', gap: Spacing.one },
  results: { backgroundColor: 'transparent', gap: Spacing.two },
});
