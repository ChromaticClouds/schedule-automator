import { ScrollView, StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';
import { AuthPanel } from '@/features/auth/auth-panel';
import { useAuthStore } from '@/features/auth/session';
import { ScheduleChatMessage } from './schedule-chat-message';
import { ScheduleDraftPanel } from './schedule-draft-panel';

export function PlanningDashboard() {
  const authenticated = useAuthStore(
    (state) => state.status === 'authenticated',
  );

  if (authenticated) return <ScheduleDraftPanel />;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScheduleChatMessage label="Schedule AI" role="assistant">
        안녕하세요. 오늘 할 일과 원하는 시간 조건을 대화로 알려주시면 실행 가능한
        일정 초안을 만들어 드릴게요. 시작하려면 Google 계정을 연결해 주세요.
      </ScheduleChatMessage>
      <AuthPanel />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: Spacing.three, paddingVertical: Spacing.three },
});
