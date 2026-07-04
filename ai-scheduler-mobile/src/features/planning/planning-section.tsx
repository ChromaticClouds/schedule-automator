import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type PlanningSectionProps = {
  title: string;
  isLoading: boolean;
  error: Error | null;
  errorMessage: string;
  empty: boolean;
  emptyMessage: string;
  children: ReactNode;
};

export function PlanningSection({
  title,
  isLoading,
  error,
  errorMessage,
  empty,
  emptyMessage,
  children,
}: PlanningSectionProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.section}>
      <ThemedText type="smallBold">{title}</ThemedText>
      {isLoading && <ThemedText type="small">Loading...</ThemedText>}
      {error && <ThemedText type="small">{errorMessage}</ThemedText>}
      {!isLoading && !error && empty && (
        <ThemedText type="small" themeColor="textSecondary">
          {emptyMessage}
        </ThemedText>
      )}
      {!isLoading && !error && children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
});
