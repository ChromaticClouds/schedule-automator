import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { PlanningButton, PlanningTextInput } from './planning-controls';

export type PlanningCreateRowProps = {
  emptyMessage: string;
  errorMessage?: string;
  guideText?: string;
  isPending: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  showEmptyMessage?: boolean;
  value: string;
};

export function PlanningCreateRow({
  emptyMessage,
  errorMessage,
  guideText,
  isPending,
  onChange,
  onSubmit,
  placeholder,
  showEmptyMessage,
  value,
}: PlanningCreateRowProps) {
  const [localEmptyMessage, setLocalEmptyMessage] = useState(false);
  const shouldShowEmptyMessage = showEmptyMessage || localEmptyMessage;
  const handleChange = (nextValue: string) => {
    if (nextValue.trim()) setLocalEmptyMessage(false);
    onChange(nextValue);
  };
  const handleSubmit = () => {
    if (!value.trim()) {
      setLocalEmptyMessage(true);
      return;
    }
    setLocalEmptyMessage(false);
    onSubmit();
  };

  return (
    <ThemedView style={styles.wrapper}>
      <ThemedView style={styles.row}>
        <PlanningTextInput
          editable={!isPending}
          onChangeText={handleChange}
          placeholder={placeholder}
          style={styles.input}
          value={value}
        />
        <PlanningButton
          disabled={isPending}
          label={isPending ? '저장 중...' : '추가'}
          onPress={handleSubmit}
          style={styles.button}
        />
      </ThemedView>
      {guideText && (
        <ThemedText type="small" themeColor="textSecondary">
          {guideText}
        </ThemedText>
      )}
      {shouldShowEmptyMessage && (
        <ThemedText type="small" themeColor="danger">
          {emptyMessage}
        </ThemedText>
      )}
      {errorMessage && (
        <ThemedText type="small" themeColor="danger">
          {errorMessage}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 56 },
  input: { flex: 1 },
  row: { backgroundColor: 'transparent', flexDirection: 'row', gap: Spacing.two },
  wrapper: { backgroundColor: 'transparent', gap: Spacing.one },
});
