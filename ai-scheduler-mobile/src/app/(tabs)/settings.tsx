import { StyleSheet, View } from 'react-native';

import { TabScreenScrollView } from '@/components/tab-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ScheduleSettingsPanel } from '@/features/settings/schedule-settings-panel';

export default function SettingsScreen() {
  return (
    <TabScreenScrollView keyboardAvoiding>
      <View style={styles.header}>
        <ThemedText type="subtitle">설정</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          하루의 시작과 작업량 기준을 내 생활 리듬에 맞추세요.
        </ThemedText>
      </View>
      <ThemedView type="backgroundElement" style={styles.summary}>
        <ThemedText type="smallBold">일정 생성 기준</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          이 값은 오늘의 일정 초안, 미룬 작업 재배치, 보호 시간 계산에 함께 반영됩니다.
        </ThemedText>
      </ThemedView>
      <ScheduleSettingsPanel />
    </TabScreenScrollView>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.one },
  summary: { borderRadius: Spacing.two, gap: Spacing.one, padding: Spacing.three },
});
