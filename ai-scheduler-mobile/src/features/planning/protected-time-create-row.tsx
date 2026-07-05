import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { PlanningButton, PlanningTextInput } from './planning-controls';
import { validProtectedTimeRange } from './protected-time-form';

type Props = {
  endTime: string;
  errorMessage?: string;
  isPending: boolean;
  onChangeEnd: (value: string) => void;
  onChangeStart: (value: string) => void;
  onChangeTitle: (value: string) => void;
  onSubmit: () => void;
  startTime: string;
  title: string;
};

export function ProtectedTimeCreateRow({
  endTime,
  errorMessage,
  isPending,
  onChangeEnd,
  onChangeStart,
  onChangeTitle,
  onSubmit,
  startTime,
  title,
}: Props) {
  const [attempted, setAttempted] = useState(false);
  const valid = Boolean(title.trim()) &&
    validProtectedTimeRange(startTime, endTime);
  const submit = () => {
    setAttempted(true);
    if (valid) onSubmit();
  };

  return (
    <View style={styles.container}>
      <PlanningTextInput
        accessibilityLabel="보호 시간 이름"
        editable={!isPending}
        onChangeText={onChangeTitle}
        placeholder="예: 점심 식사"
        value={title}
      />
      <View style={styles.timeRow}>
        <PlanningTextInput
          accessibilityLabel="보호 시간 시작"
          editable={!isPending}
          maxLength={5}
          onChangeText={onChangeStart}
          placeholder="12:00"
          style={styles.timeInput}
          value={startTime}
        />
        <ThemedText>~</ThemedText>
        <PlanningTextInput
          accessibilityLabel="보호 시간 종료"
          editable={!isPending}
          maxLength={5}
          onChangeText={onChangeEnd}
          placeholder="13:00"
          style={styles.timeInput}
          value={endTime}
        />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        평일에 반복되는 시간을 24시간 형식으로 입력해 주세요. 예: 점심 식사,
        12:00–13:00
      </ThemedText>
      {attempted && !valid && (
        <ThemedText type="small" themeColor="danger">
          이름을 입력하고 종료 시간을 시작 시간보다 늦게 설정해 주세요.
        </ThemedText>
      )}
      {errorMessage && (
        <ThemedText type="small" themeColor="danger">
          {errorMessage}
        </ThemedText>
      )}
      <PlanningButton
        disabled={isPending}
        label={isPending ? '저장 중...' : '보호 시간 추가'}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two },
  timeInput: { flex: 1 },
  timeRow: { alignItems: 'center', flexDirection: 'row', gap: Spacing.two },
});
