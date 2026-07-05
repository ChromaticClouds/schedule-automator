import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { TaskSummary } from './types';

const labels: Record<string, string> = {
  done: '완료',
  missed: '미룸',
  overflow: '보류',
  scheduled: '예정',
  todo: '할 일',
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
      <ThemedText type="subtitle">작업 요약</ThemedText>
      {isLoading && <ThemedText type="small">작업 요약을 불러오는 중...</ThemedText>}
      {errorMessage && <ThemedText type="small">{errorMessage}</ThemedText>}
      {summary && (
        <>
          <ThemedText type="small" themeColor="textSecondary">
            작업 {summary.totals.count}개 / {summary.totals.estimatedMinutes}분
          </ThemedText>
          <ThemedView style={styles.grid}>
            {summary.statuses.map((status) => (
              <ThemedView key={status} style={styles.bucket}>
                <ThemedText type="smallBold">
                  {labels[status] ?? status}
                </ThemedText>
                <ThemedText type="small">
                  {summary.byStatus[status]?.count ?? 0}개 /{' '}
                  {summary.byStatus[status]?.estimatedMinutes ?? 0}분
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
          {summary.tasks.length === 0 && (
            <ThemedText type="small">
              아직 작업이 없습니다. 작업을 추가하거나 목표를 AI로 분해하세요.
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
