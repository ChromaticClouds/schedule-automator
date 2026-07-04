import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { GoalBreakdownFeedback } from './goal-breakdown-state';
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
    <ThemedView type="backgroundElement" style={styles.panel}>
      <ThemedText type="subtitle">AI task breakdown</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Turn an active weekly goal into executable tasks.
      </ThemedText>
      {isLoading && <ThemedText type="small">Loading goals...</ThemedText>}
      {!isLoading && goals.length === 0 && (
        <ThemedText type="small">Create an active goal first.</ThemedText>
      )}
      {goals.map((goal) => {
        const busy = busyGoalId === goal._id;
        return (
          <ThemedView key={goal._id} style={styles.row}>
            <ThemedText type="small" style={styles.title}>
              {goal.title}
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              disabled={Boolean(busyGoalId)}
              onPress={() => onGenerate(goal._id)}
              style={[styles.button, busyGoalId && styles.disabled]}
            >
              <ThemedText type="smallBold">
                {busy ? 'Generating...' : 'Break down'}
              </ThemedText>
            </Pressable>
          </ThemedView>
        );
      })}
      {feedback && (
        <ThemedText
          type="small"
          themeColor={feedback.kind === 'error' ? 'text' : 'textSecondary'}
        >
          {feedback.message}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#DCEBFF',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  disabled: { opacity: 0.5 },
  panel: { borderRadius: Spacing.two, gap: Spacing.two, padding: Spacing.three },
  row: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  title: { flex: 1 },
});
