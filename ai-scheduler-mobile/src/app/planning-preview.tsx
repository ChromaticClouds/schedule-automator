import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ENV } from '@/config/env';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { PlanningStatePreview } from '@/features/planning/planning-state-preview';

export default function PlanningPreviewScreen() {
  const enabled = __DEV__ || ENV.ENABLE_DEV_TOOLS;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {enabled ? (
          <PlanningStatePreview />
        ) : (
          <ThemedView type="backgroundElement" style={styles.blocked}>
            <ThemedText type="smallBold">Planning preview unavailable</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              This internal state preview is disabled outside development tools.
            </ThemedText>
          </ThemedView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  blocked: { borderRadius: Spacing.two, gap: Spacing.two, padding: Spacing.three },
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingBottom: BottomTabInset + Spacing.three,
    paddingHorizontal: Spacing.three,
  },
});
