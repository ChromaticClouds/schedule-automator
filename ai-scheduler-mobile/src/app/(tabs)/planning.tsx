import { View } from 'react-native';

import { TabScreenScrollView } from '@/components/tab-screen';
import { ThemedText } from '@/components/themed-text';
import { AuthPanel } from '@/features/auth/auth-panel';
import { useAuthStore } from '@/features/auth/session';
import { GoalBreakdownPanel } from '@/features/planning/goal-breakdown-panel';
import { PlanningCreateSections } from '@/features/planning/planning-create-sections';
import { TaskSummaryPanel } from '@/features/planning/task-summary-panel';

export default function PlanningToolsScreen() {
  const authenticated = useAuthStore(
    (state) => state.status === 'authenticated',
  );

  return (
    <TabScreenScrollView keyboardAvoiding>
      <View className="gap-1">
        <ThemedText type="subtitle">계획 관리</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          AI가 일정에 사용할 목표와 작업, 보호 시간을 관리하세요.
        </ThemedText>
      </View>
      <AuthPanel />
      {authenticated && <TaskSummaryPanel />}
      {authenticated && <GoalBreakdownPanel />}
      {authenticated && <PlanningCreateSections />}
    </TabScreenScrollView>
  );
}
