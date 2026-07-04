import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export type PlanningCreateRowProps = {
  emptyMessage: string;
  errorMessage?: string;
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
        <TextInput
          editable={!isPending}
          onChangeText={handleChange}
          placeholder={placeholder}
          style={styles.input}
          value={value}
        />
        <Pressable
          disabled={isPending}
          onPress={handleSubmit}
          style={[styles.button, isPending && styles.disabledButton]}
        >
          <ThemedText type="smallBold">
            {isPending ? 'Saving...' : 'Add'}
          </ThemedText>
        </Pressable>
      </ThemedView>
      {shouldShowEmptyMessage && (
        <ThemedText type="small" themeColor="textSecondary">
          {emptyMessage}
        </ThemedText>
      )}
      {errorMessage && <ThemedText type="small">{errorMessage}</ThemedText>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#DCEBFF',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  disabledButton: { opacity: 0.6 },
  input: {
    borderColor: '#9AA0A6',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: Spacing.two,
  },
  row: { backgroundColor: 'transparent', flexDirection: 'row', gap: Spacing.two },
  wrapper: { backgroundColor: 'transparent', gap: Spacing.one },
});
