import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { ThemedView } from './themed-view';

type FrameProps = {
  children: ReactNode;
};

type ScrollProps = FrameProps & {
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardAvoiding?: boolean;
};

export function TabScreenFrame({ children }: FrameProps) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
        {children}
      </SafeAreaView>
    </ThemedView>
  );
}

export function TabScreenScrollView({
  children,
  contentContainerStyle,
  keyboardAvoiding = false,
}: ScrollProps) {
  const scrollView = (
    <ScrollView
      contentContainerStyle={[styles.content, contentContainerStyle]}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={styles.scroll}
    >
      {children}
    </ScrollView>
  );

  return (
    <TabScreenFrame>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          {scrollView}
        </KeyboardAvoidingView>
      ) : (
        scrollView
      )}
    </TabScreenFrame>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  content: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
    paddingTop: Spacing.three,
  },
  keyboard: { flex: 1 },
  scroll: { flex: 1 },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingBottom: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
});
