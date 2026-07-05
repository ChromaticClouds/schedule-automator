import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

const steps = [
  '1. 이번 주 목표를 먼저 추가합니다.',
  '2. 실행할 작업과 예상 소요 시간을 입력합니다.',
  '3. 점심, 운동, 집중 시간처럼 침범하면 안 되는 보호 시간을 추가합니다.',
  '4. 오늘의 초안을 생성하고 일정 블록을 검토합니다.',
  '5. 하루가 끝나면 완료/미완료를 리뷰하고 재배치를 실행합니다.',
];

export function PlanningFlowGuide() {
  return (
    <ThemedView style={styles.card} type="backgroundElement">
      <ThemedText type="smallBold">사용 순서 가이드</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        아래 순서대로 입력하면 AI 초안 생성과 하루 리뷰가 자연스럽게 이어집니다.
      </ThemedText>
      {steps.map((step) => (
        <ThemedText key={step} type="small">
          {step}
        </ThemedText>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    gap: Spacing.one,
    padding: Spacing.three,
  },
});
