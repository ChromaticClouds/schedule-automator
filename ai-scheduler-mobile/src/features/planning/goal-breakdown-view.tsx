import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { GoalBreakdownFeedback } from './goal-breakdown-state';
import { PlanningButton } from './planning-controls';
import type { Goal } from './types';

export type GoalBreakdownViewProps = {
  busyGoalId?: string;
  feedback?: GoalBreakdownFeedback;
  goals: Goal[];
  isLoading: boolean;
  onGenerate: (goalId: string) => void;
};

export function GoalBreakdownView({
  busyGoalId,
  feedback,
  goals,
  isLoading,
  onGenerate,
}: GoalBreakdownViewProps) {
  return (
    <ThemedView style={styles.panel} type="backgroundElement">
      <ThemedText type="subtitle">AI 작업 분해</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        활성 주간 목표를 실행 가능한 작업 목록으로 나눕니다.
      </ThemedText>
      {isLoading && <ThemedText type="small">목표를 불러오는 중...</ThemedText>}
      {!isLoading && goals.length === 0 && (
        <ThemedText type="small">먼저 활성 목표를 추가해 주세요.</ThemedText>
      )}
      {goals.map((goal) => {
        const busy = busyGoalId === goal._id;
        return (
          <ThemedView key={goal._id} style={styles.row}>
            <ThemedText type="small" style={styles.title}>
              {goal.title}
            </ThemedText>
            <PlanningButton
              disabled={Boolean(busyGoalId)}
              label={busy ? '생성 중...' : '분해'}
              onPress={() => onGenerate(goal._id)}
              style={styles.button}
            />
          </ThemedView>
        );
      })}
      {feedback && (
        <ThemedText
          themeColor={feedback.kind === 'error' ? 'danger' : 'textSecondary'}
          type="small"
        >
          {feedback.message}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  panel: { borderRadius: Spacing.two, gap: Spacing.two, padding: Spacing.three },
  row: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  title: { flex: 1 },
});
