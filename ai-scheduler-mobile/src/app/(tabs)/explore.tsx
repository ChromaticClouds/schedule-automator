import { Link, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ENV } from '@/config/env';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const features = [
  {
    eyebrow: '계획',
    title: '목표에서 실행 일정까지',
    body: '주간 목표와 작업을 등록하고 AI 일정 초안을 검토한 뒤 캘린더에 반영합니다.',
  },
  {
    eyebrow: '보호',
    title: '중요한 시간을 먼저 확보',
    body: '식사, 운동, 휴식처럼 침범하면 안 되는 시간을 일정 생성 전에 지정합니다.',
  },
  {
    eyebrow: '회고',
    title: '놓친 작업을 다음 계획으로',
    body: '하루를 검토하고 미완료 작업을 남은 주간 일정에 다시 배치합니다.',
  },
];

export default function ExploreScreen() {
  const showDevTools = __DEV__ || ENV.ENABLE_DEV_TOOLS;
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="subtitle">탐색</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              계획 흐름을 빠르게 이해하고 필요한 기능을 찾아보세요.
            </ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.featureGroup}>
            <ThemedText type="smallBold">Schedule Automator 활용 흐름</ThemedText>
            {features.map((feature, index) => (
              <View key={feature.title} style={styles.featureRow}>
                <View
                  style={[
                    styles.step,
                    { backgroundColor: theme.backgroundSelected },
                  ]}>
                  <ThemedText type="smallBold">{index + 1}</ThemedText>
                </View>
                <View style={styles.featureCopy}>
                  <ThemedText type="small" themeColor="primary">
                    {feature.eyebrow}
                  </ThemedText>
                  <ThemedText type="smallBold">{feature.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {feature.body}
                  </ThemedText>
                </View>
              </View>
            ))}
          </ThemedView>

          {showDevTools && (
            <Link href={'/planning-preview' as Href} asChild>
              <Pressable
                accessibilityLabel="계획 상태 미리보기 열기"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.previewButton,
                  { backgroundColor: theme.primary },
                  pressed && styles.pressed,
                ]}>
                <View style={styles.previewCopy}>
                  <ThemedText type="smallBold" style={{ color: theme.primaryText }}>
                    계획 상태 미리보기
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.primaryText }}>
                    샘플 데이터로 로딩·오류·완료 화면을 점검합니다.
                  </ThemedText>
                </View>
                <ThemedText style={{ color: theme.primaryText }}>›</ThemedText>
              </Pressable>
            </Link>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  content: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
    paddingTop: Spacing.three,
  },
  featureCopy: { flex: 1, gap: Spacing.one },
  featureGroup: {
    borderRadius: Spacing.three,
    gap: Spacing.three,
    padding: Spacing.three,
  },
  featureRow: { flexDirection: 'row', gap: Spacing.three },
  header: { gap: Spacing.one },
  pressed: { opacity: 0.78 },
  previewButton: {
    alignItems: 'center',
    borderRadius: Spacing.three,
    flexDirection: 'row',
    minHeight: 64,
    padding: Spacing.three,
  },
  previewCopy: { flex: 1, gap: Spacing.one },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  step: {
    alignItems: 'center',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
});
