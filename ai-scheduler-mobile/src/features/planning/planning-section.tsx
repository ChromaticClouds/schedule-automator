import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type PlanningSectionProps = {
  children: ReactNode;
  empty: boolean;
  emptyMessage: string;
  error: Error | null;
  errorMessage: string;
  isLoading: boolean;
  title: string;
};

export function PlanningSection({
  children,
  empty,
  emptyMessage,
  error,
  errorMessage,
  isLoading,
  title,
}: PlanningSectionProps) {
  return (
    <ThemedView style={styles.section} type="backgroundElement">
      <ThemedText type="smallBold">{title}</ThemedText>
      {isLoading && <ThemedText type="small">불러오는 중...</ThemedText>}
      {error && (
        <ThemedText type="small" themeColor="danger">
          {errorMessage}
        </ThemedText>
      )}
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
    borderRadius: Spacing.two,
    gap: Spacing.two,
    padding: Spacing.three,
  },
});
