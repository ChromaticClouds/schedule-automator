import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  planningStateCatalog,
  planningStateCatalogGroups,
} from './planning-state-catalog';

export function CatalogIndex() {
  return (
    <ThemedView type="backgroundElement" style={styles.section}>
      <ThemedText type="smallBold">Catalog groups</ThemedText>
      {planningStateCatalogGroups.map((group) => (
        <ThemedText key={group} type="small" themeColor="textSecondary">
          {group}: {planningStateCatalog[group].map((entry) => entry.name).join(', ')}
        </ThemedText>
      ))}
    </ThemedView>
  );
}

export function PreviewGroup({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <ThemedView style={styles.group}>
      <ThemedText type="smallBold">{title}</ThemedText>
      {children}
    </ThemedView>
  );
}

export function PreviewCard({
  children,
  entry,
}: {
  children: ReactNode;
  entry: string;
}) {
  return (
    <ThemedView style={styles.card}>
      <ThemedText type="smallBold">{entry}</ThemedText>
      {children}
    </ThemedView>
  );
}

export function CopyCard({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.section}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">{value}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'transparent', gap: Spacing.two },
  group: { backgroundColor: 'transparent', gap: Spacing.two },
  section: { borderRadius: Spacing.two, gap: Spacing.one, padding: Spacing.three },
});
