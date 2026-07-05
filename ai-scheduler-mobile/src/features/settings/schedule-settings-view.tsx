import { StyleSheet, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { PlanningButton, PlanningTextInput } from '@/features/planning/planning-controls';
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
  if (isLoading) {
    return (
      <ThemedView type="backgroundElement" style={styles.panel}>
        <ThemedText type="small">일정 설정을 불러오는 중...</ThemedText>
      </ThemedView>
    );
  }
  return (
    <ThemedView type="backgroundElement" style={styles.panel}>
      <View style={styles.section}>
        <ThemedText type="smallBold">하루 시작</ThemedText>
        <Field
          helper="24시간 형식으로 입력하세요. 예: 07:00"
          label="기상 시간"
          onChange={(value) => onChange('wakeTime', value)}
          placeholder="07:00"
          value={form.wakeTime}
        />
        <Field
          helper="일정 날짜 계산에 사용할 표준 시간대입니다."
          label="시간대"
          onChange={(value) => onChange('timezone', value)}
          placeholder="Asia/Seoul"
          value={form.timezone}
        />
      </View>
      <View style={styles.section}>
        <ThemedText type="smallBold">작업량 제한</ThemedText>
        <Field
          helper="하루 60~720분 사이로 설정하세요."
          keyboardType="number-pad"
          label="하루 최대 작업 시간(분)"
          onChange={(value) => onChange('maxDailyWorkMinutes', value)}
          placeholder="480"
          value={form.maxDailyWorkMinutes}
        />
        <Field
          helper="기상 후 첫 일정까지 0~240분의 여유를 둡니다."
          keyboardType="number-pad"
          label="기상 후 준비 시간(분)"
          onChange={(value) => onChange('wakeOffsetMinutes', value)}
          placeholder="10"
          value={form.wakeOffsetMinutes}
        />
      </View>
      {!valid && (
        <ThemedText type="small" themeColor="danger">
          입력 형식과 허용 범위를 확인하세요.
        </ThemedText>
      )}
      {errorMessage && (
        <ThemedText
          accessibilityLiveRegion="polite"
          type="small"
          themeColor="danger">
          설정을 저장하지 못했습니다. 잠시 후 다시 시도하세요.
        </ThemedText>
      )}
      {isSuccess && (
        <ThemedText
          accessibilityLiveRegion="polite"
          type="small"
          themeColor="success">
          일정 설정을 저장했습니다.
        </ThemedText>
      )}
      <PlanningButton
        accessibilityLabel="일정 설정 저장"
        disabled={!valid || isSaving}
        label={isSaving ? '저장 중...' : '설정 저장'}
        onPress={onSave}
      />
    </ThemedView>
  );
}

function Field({
  helper,
  keyboardType,
  label,
  onChange,
  placeholder,
  value,
}: {
  helper: string;
  keyboardType?: TextInputProps['keyboardType'];
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <PlanningTextInput
        accessibilityLabel={label}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={keyboardType}
        onChangeText={onChange}
        placeholder={placeholder}
        value={value}
      />
      <ThemedText type="small" themeColor="textSecondary">
        {helper}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: Spacing.one },
  panel: {
    borderRadius: Spacing.three,
    gap: Spacing.three,
    padding: Spacing.three,
  },
  section: { gap: Spacing.two },
});
