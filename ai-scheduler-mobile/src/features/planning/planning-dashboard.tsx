import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { AuthPanel } from '@/features/auth/auth-panel';
import { useAuthStore } from '@/features/auth/session';
import { DailyReviewPanel } from './daily-review-panel';
import { GoalBreakdownPanel } from './goal-breakdown-panel';
import { PlanningCreateSections } from './planning-create-sections';
import { ScheduleDraftPanel } from './schedule-draft-panel';
import { TaskSummaryPanel } from './task-summary-panel';
import { WeeklyReschedulePanel } from './weekly-reschedule-panel';

export function PlanningDashboard() {
  const authenticated = useAuthStore(
    (state) => state.status === 'authenticated',
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">Weekly planning</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Goals, tasks, and protected time for the current week.
        </ThemedText>
      </ThemedView>

      <AuthPanel />

      {authenticated && <ScheduleDraftPanel />}
      {authenticated && <DailyReviewPanel />}
      {authenticated && <WeeklyReschedulePanel />}
      {authenticated && <TaskSummaryPanel />}
      {authenticated && <GoalBreakdownPanel />}
      {authenticated && <PlanningCreateSections />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.three, paddingTop: Spacing.three },
  header: { gap: Spacing.one },
});
