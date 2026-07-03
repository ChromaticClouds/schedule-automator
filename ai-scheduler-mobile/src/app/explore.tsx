import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const sections = [
  {
    title: 'Current flow',
    body: 'Weekly goals, tasks, and protected time now share a mobile planning surface.',
  },
  {
    title: 'Secure auth',
    body: 'Google sign-in now exchanges short-lived access and rotating refresh credentials.',
  },
  {
    title: 'Next layer',
    body: 'The next useful step is replacing fixed form defaults with editable planning fields.',
  },
];

export default function ExploreScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">Project notes</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              A compact reference for the Schedule Automator MVP.
            </ThemedText>
          </ThemedView>

          {sections.map((section) => (
            <ThemedView
              key={section.title}
              type="backgroundElement"
              style={styles.section}>
              <ThemedText type="smallBold">{section.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {section.body}
              </ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  content: {
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
  section: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
});
