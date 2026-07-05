import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { PlanningButton } from './planning-controls';
import type { WeeklyRescheduleResult } from './types';
import { weeklyRescheduleResultSummary } from './weekly-reschedule-state';

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
  const busy = disabled || isPending;

  return (
    <ThemedView type="backgroundElement" style={styles.panel}>
      <ThemedText type="smallBold">주간 미완료 작업 재배치</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        미룬 작업을 이번 주 남은 날짜에 다시 배치합니다.
      </ThemedText>
      <PlanningButton
        accessibilityRole="button"
        disabled={busy}
        label={isPending ? '재배치 중...' : '미룬 작업 재배치'}
        onPress={onRun}
        style={styles.button}
      />
      {disabled && !result && (
        <ThemedText type="small">재배치할 미완료 작업이 아직 없습니다.</ThemedText>
      )}
      {errorMessage && (
        <ThemedText type="small" themeColor="danger">
          실패: {errorMessage}
        </ThemedText>
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
    return <ThemedText type="small">이 주간 재배치는 이미 처리되었습니다.</ThemedText>;
  }
  return (
    <ThemedView style={styles.results}>
      <ThemedText type="smallBold">{weeklyRescheduleResultSummary(result)}</ThemedText>
      {result.drafts.length > 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          생성된 초안을 확인한 뒤 캘린더 동기화를 승인하세요.
        </ThemedText>
      )}
      {result.drafts.map((draft) => (
        <ThemedView key={draft._id} style={styles.resultGroup}>
          <ThemedText type="smallBold">{draft.date}</ThemedText>
          {draft.blocks
            .filter(({ taskId }) => result.placedTaskIds.includes(taskId ?? ''))
            .map((block) => (
              <ThemedText key={block._id} type="small">
                {block.title} / {formatTime(block.start)}
              </ThemedText>
            ))}
        </ThemedView>
      ))}
      {result.overflowTaskIds.map((taskId) => (
        <ThemedText key={taskId} type="small">
          보류 / {taskNames[taskId] ?? taskId}
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
  button: { alignSelf: 'flex-start', borderRadius: 8, padding: Spacing.two },
  panel: { borderRadius: Spacing.two, gap: Spacing.two, padding: Spacing.three },
  resultGroup: { backgroundColor: 'transparent', gap: Spacing.one },
  results: { backgroundColor: 'transparent', gap: Spacing.two },
});
