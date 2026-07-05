import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { PlanningButton } from '@/features/planning/planning-controls';
import { signInWithGoogle } from './oauth';
import { logoutAuthSession, useAuthStore } from './session';

export function AuthPanel() {
  const status = useAuthStore((state) => state.status);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const run = async (action: () => Promise<unknown>) => {
    setPending(true);
    setError(undefined);
    try {
      await action();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '로그인 처리에 실패했습니다.');
    } finally {
      setPending(false);
    }
  };

  if (status === 'loading') {
    return <ThemedText type="small">보안 세션을 복구하는 중입니다...</ThemedText>;
  }

  const authenticated = status === 'authenticated';
  return (
    <ThemedView type="backgroundElement" style={styles.panel}>
      <ThemedView style={styles.copy}>
        <ThemedText type="smallBold">
          {authenticated ? 'Google 계정 연결됨' : '로그인이 필요합니다'}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {authenticated
            ? '계획 요청은 서버의 보안 세션으로 처리됩니다.'
            : '계획 데이터를 불러오고 업데이트하려면 Google 계정을 연결하세요.'}
        </ThemedText>
      </ThemedView>
      <PlanningButton
        disabled={pending}
        label={pending ? '처리 중...' : authenticated ? '로그아웃' : 'Google로 계속하기'}
        onPress={() =>
          void run(authenticated ? logoutAuthSession : signInWithGoogle)
        }
        style={styles.button}
      />
      {error && (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: Spacing.two,
    gap: Spacing.two,
    padding: Spacing.three,
  },
  copy: { backgroundColor: 'transparent', gap: Spacing.one },
  button: {
    alignItems: 'center',
    borderRadius: 8,
    padding: Spacing.two,
  },
});
