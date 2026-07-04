import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { TaskSummary } from './types';

const labels: Record<string, string> = {
  done: 'Done',
  missed: 'Missed',
  overflow: 'Overflow',
  scheduled: 'Scheduled',
  todo: 'Todo',
};

export type TaskSummaryViewProps = {
  errorMessage?: string;
  isLoading: boolean;
  summary?: TaskSummary;
};

export function TaskSummaryView({
  errorMessage,
  isLoading,
  summary,
}: TaskSummaryViewProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.panel}>
      <ThemedText type="subtitle">Task summary</ThemedText>
      {isLoading && <ThemedText type="small">Loading task summary...</ThemedText>}
      {errorMessage && <ThemedText type="small">{errorMessage}</ThemedText>}
      {summary && (
        <>
          <ThemedText type="small" themeColor="textSecondary">
            {summary.totals.count} tasks · {summary.totals.estimatedMinutes}m
          </ThemedText>
          <ThemedView style={styles.grid}>
            {summary.statuses.map((status) => (
              <ThemedView key={status} style={styles.bucket}>
                <ThemedText type="smallBold">
                  {labels[status] ?? status}
                </ThemedText>
                <ThemedText type="small">
                  {summary.byStatus[status]?.count ?? 0} ·{' '}
                  {summary.byStatus[status]?.estimatedMinutes ?? 0}m
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
          {summary.tasks.length === 0 && (
            <ThemedText type="small">
              No tasks yet. Add a task or break down a goal to populate this summary.
            </ThemedText>
          )}
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  bucket: {
    backgroundColor: 'transparent',
    borderColor: '#DCEBFF',
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 96,
    padding: Spacing.two,
  },
  grid: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  panel: { borderRadius: Spacing.two, gap: Spacing.two, padding: Spacing.three },
});
