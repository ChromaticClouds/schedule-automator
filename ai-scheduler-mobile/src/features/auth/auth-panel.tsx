import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { signInWithGoogle } from './oauth';
import { logoutAuthSession, useAuthStore } from './session';

export function AuthPanel() {
  const queryClient = useQueryClient();
  const status = useAuthStore((state) => state.status);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const run = async (action: () => Promise<unknown>) => {
    setPending(true);
    setError(undefined);
    try {
      await action();
      await queryClient.invalidateQueries();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Authentication failed');
    } finally {
      setPending(false);
    }
  };

  if (status === 'loading') {
    return <ThemedText type="small">Restoring secure session...</ThemedText>;
  }

  const authenticated = status === 'authenticated';
  return (
    <ThemedView type="backgroundElement" style={styles.panel}>
      <ThemedView style={styles.copy}>
        <ThemedText type="smallBold">
          {authenticated ? 'Google account connected' : 'Sign in required'}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {authenticated
            ? 'Planning requests use your secure server session.'
            : 'Connect Google to load and update your planning data.'}
        </ThemedText>
      </ThemedView>
      <Pressable
        disabled={pending}
        onPress={() =>
          void run(authenticated ? logoutAuthSession : signInWithGoogle)
        }
        style={[styles.button, pending && styles.disabled]}>
        <ThemedText type="smallBold">
          {pending ? 'Please wait...' : authenticated ? 'Sign out' : 'Continue with Google'}
        </ThemedText>
      </Pressable>
      {error && <ThemedText type="small">{error}</ThemedText>}
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
    backgroundColor: '#DCEBFF',
    borderRadius: 8,
    padding: Spacing.two,
  },
  disabled: { opacity: 0.6 },
});
