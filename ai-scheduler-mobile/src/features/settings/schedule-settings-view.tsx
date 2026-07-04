import { Pressable, StyleSheet, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { SchedulePreferencesForm } from './types';

export type ScheduleSettingsViewProps = {
  errorMessage?: string;
  form: SchedulePreferencesForm;
  isLoading: boolean;
  isSaving: boolean;
  isSuccess: boolean;
  onChange: (field: keyof SchedulePreferencesForm, value: string) => void;
  onSave: () => void;
  valid: boolean;
};

export function ScheduleSettingsView({
  errorMessage,
  form,
  isLoading,
  isSaving,
  isSuccess,
  onChange,
  onSave,
  valid,
}: ScheduleSettingsViewProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.panel}>
      <ThemedText type="subtitle">Schedule settings</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        These values control daily planning and future automatic generation.
      </ThemedText>
      {isLoading ? (
        <ThemedText type="small">Loading settings...</ThemedText>
      ) : (
        <>
          <Field
            label="Wake time (HH:mm)"
            onChange={(value) => onChange('wakeTime', value)}
            value={form.wakeTime}
          />
          <Field
            label="Timezone"
            onChange={(value) => onChange('timezone', value)}
            value={form.timezone}
          />
          <Field
            keyboardType="number-pad"
            label="Maximum daily work minutes"
            onChange={(value) => onChange('maxDailyWorkMinutes', value)}
            value={form.maxDailyWorkMinutes}
          />
          <Field
            keyboardType="number-pad"
            label="Wake offset minutes"
            onChange={(value) => onChange('wakeOffsetMinutes', value)}
            value={form.wakeOffsetMinutes}
          />
          <Pressable
            accessibilityRole="button"
            disabled={!valid || isSaving}
            onPress={onSave}
            style={[styles.button, (!valid || isSaving) && styles.disabled]}
          >
            <ThemedText type="smallBold">
              {isSaving ? 'Saving...' : 'Save settings'}
            </ThemedText>
          </Pressable>
        </>
      )}
      {errorMessage && <ThemedText type="small">Failed: {errorMessage}</ThemedText>}
      {isSuccess && <ThemedText type="small">Settings saved.</ThemedText>}
    </ThemedView>
  );
}

function Field({
  keyboardType,
  label,
  onChange,
  value,
}: {
  keyboardType?: 'number-pad';
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <ThemedView style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        autoCapitalize="none"
        keyboardType={keyboardType}
        onChangeText={onChange}
        style={styles.input}
        value={value}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  button: { alignSelf: 'flex-start', backgroundColor: '#DCEBFF', borderRadius: 8, padding: Spacing.two },
  disabled: { opacity: 0.5 },
  field: { backgroundColor: 'transparent', gap: Spacing.one },
  input: { borderColor: '#9AA0A6', borderRadius: 8, borderWidth: 1, padding: Spacing.two },
  panel: { borderRadius: Spacing.two, gap: Spacing.three, padding: Spacing.three },
});
