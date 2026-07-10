import { View } from 'react-native';

import { TabScreenScrollView } from '@/components/tab-screen';
import { ThemedText } from '@/components/themed-text';
import { AuthPanel } from '@/features/auth/auth-panel';
import { useAuthStore } from '@/features/auth/session';
import { DailyReviewPanel } from '@/features/planning/daily-review-panel';
import { WeeklyReschedulePanel } from '@/features/planning/weekly-reschedule-panel';

export default function ReviewScreen() {
  const authenticated = useAuthStore(
    (state) => state.status === 'authenticated',
  );

  return (
    <TabScreenScrollView>
      <View className="gap-1">
        <ThemedText type="subtitle">오늘 회고</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          완료 여부를 확인하고 남은 작업을 이번 주에 다시 배치하세요.
        </ThemedText>
      </View>
      {!authenticated && <AuthPanel />}
      {authenticated && <DailyReviewPanel />}
      {authenticated && <WeeklyReschedulePanel />}
    </TabScreenScrollView>
  );
}
