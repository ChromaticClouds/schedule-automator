import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { PlanningButton, PlanningTextInput } from './planning-controls';

type Props = {
  errorMessage?: string;
  isPending: boolean;
  minutes: string;
  onChangeMinutes: (value: string) => void;
  onChangeTitle: (value: string) => void;
  onSubmit: (estimatedMinutes: number) => void;
  title: string;
};

const parseMinutes = (value: string) => Number.parseInt(value, 10);

export function PlanningTaskCreateRow({
  errorMessage,
  isPending,
  minutes,
  onChangeMinutes,
  onChangeTitle,
  onSubmit,
  title,
}: Props) {
  const [attempted, setAttempted] = useState(false);
  const estimatedMinutes = parseMinutes(minutes);
  const validMinutes = Number.isInteger(estimatedMinutes) &&
    estimatedMinutes >= 5 &&
    estimatedMinutes <= 480;
  const valid = Boolean(title.trim()) && validMinutes;
  const submit = () => {
    setAttempted(true);
    if (valid) onSubmit(estimatedMinutes);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <PlanningTextInput
          accessibilityLabel="작업 제목"
          editable={!isPending}
          onChangeText={onChangeTitle}
          placeholder="예: README 실행 방법 정리"
          style={styles.titleInput}
          value={title}
        />
        <PlanningTextInput
          accessibilityLabel="예상 소요 시간"
          editable={!isPending}
          keyboardType="number-pad"
          maxLength={3}
          onChangeText={onChangeMinutes}
          placeholder="60"
          style={styles.minutesInput}
          value={minutes}
        />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        작업명과 시간을 분리해서 입력해 주세요. 기본값은 60분이며 5~480분까지 가능합니다.
      </ThemedText>
      {attempted && !valid && (
        <ThemedText type="small" themeColor="danger">
          작업 제목을 입력하고 예상 시간을 5~480분 사이 숫자로 설정해 주세요.
        </ThemedText>
      )}
      {errorMessage && (
        <ThemedText type="small" themeColor="danger">
          {errorMessage}
        </ThemedText>
      )}
      <PlanningButton
        disabled={isPending}
        label={isPending ? '저장 중...' : '작업 추가'}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two },
  minutesInput: { width: 92 },
  row: { flexDirection: 'row', gap: Spacing.two },
  titleInput: { flex: 1 },
});
