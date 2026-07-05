import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={BottomTabInset}
      style={styles.keyboard}
    >
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">주간 계획</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            이번 주 목표, 작업, 보호 시간을 한곳에서 정리하세요.
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.six,
    paddingTop: Spacing.three,
  },
  header: { gap: Spacing.one },
  keyboard: { flex: 1 },
});
