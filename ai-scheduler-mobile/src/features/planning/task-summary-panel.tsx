import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTaskSummary } from './hooks';

const labels: Record<string, string> = {
  done: 'Done',
  missed: 'Missed',
  overflow: 'Overflow',
  scheduled: 'Scheduled',
  todo: 'Todo',
};

export function TaskSummaryPanel() {
  const query = useTaskSummary();
  const summary = query.data;

  return (
    <ThemedView type="backgroundElement" style={styles.panel}>
      <ThemedText type="subtitle">Task summary</ThemedText>
      {query.isLoading && <ThemedText type="small">Loading tasks...</ThemedText>}
      {query.error && (
        <ThemedText type="small">Failed to load task summary.</ThemedText>
      )}
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
            <ThemedText type="small">No matching tasks yet.</ThemedText>
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
