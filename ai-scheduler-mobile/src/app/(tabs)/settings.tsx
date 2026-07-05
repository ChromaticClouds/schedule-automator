import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { ScheduleSettingsPanel } from '@/features/settings/schedule-settings-panel';

export default function SettingsScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <ThemedText type="subtitle">설정</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                하루의 시작과 작업량 기준을 내 생활 리듬에 맞추세요.
              </ThemedText>
            </View>
            <ScheduleSettingsPanel />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  content: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
    paddingTop: Spacing.three,
  },
  header: { gap: Spacing.one },
  keyboard: { flex: 1 },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
