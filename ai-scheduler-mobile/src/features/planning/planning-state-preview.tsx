import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { CatalogIndex } from './planning-state-preview-layout';
import { PlanningStatePreviewSections } from './planning-state-preview-sections';

export function PlanningStatePreview() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">Planning state preview</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Dev-only catalog previews for manual state verification.
        </ThemedText>
      </ThemedView>
      <CatalogIndex />
      <PlanningStatePreviewSections />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.three, paddingTop: Spacing.three },
  header: { gap: Spacing.one },
});
