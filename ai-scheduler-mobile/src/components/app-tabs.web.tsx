import {
  TabList,
  TabSlot,
  Tabs,
  TabTrigger,
  type TabListProps,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

const webTabBarHeight = 80;

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>홈</TabButton>
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>탐색</TabButton>
          </TabTrigger>
          <TabTrigger name="settings" href="/settings" asChild>
            <TabButton>설정</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable
      {...props}
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) => [
        styles.tabButton,
        pressed && styles.pressed,
      ]}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText
          type="smallBold"
          themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    alignItems: 'center',
    borderRadius: Spacing.three,
    flexDirection: 'row',
    gap: Spacing.one,
    maxWidth: MaxContentWidth,
    padding: Spacing.two,
  },
  pressed: { opacity: 0.72 },
  slot: { height: '100%', paddingBottom: webTabBarHeight },
  tabButton: { minHeight: 44 },
  tabButtonView: {
    borderRadius: Spacing.two,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: Spacing.three,
  },
  tabListContainer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    minHeight: webTabBarHeight,
    padding: Spacing.two,
    position: 'absolute',
    width: '100%',
  },
});
