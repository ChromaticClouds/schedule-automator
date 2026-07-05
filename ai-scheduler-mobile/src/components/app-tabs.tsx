import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      iconColor={{
        default: colors.textSecondary,
        selected: colors.primary,
      }}
      indicatorColor={colors.backgroundSelected}
      labelStyle={{
        default: { color: colors.textSecondary, fontSize: 12 },
        selected: { color: colors.text, fontSize: 12, fontWeight: '700' },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>홈</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: 'home', selected: 'home' }}
          sf={{ default: 'house', selected: 'house.fill' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>탐색</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: 'explore', selected: 'explore' }}
          sf={{ default: 'safari', selected: 'safari.fill' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>설정</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: 'settings', selected: 'settings' }}
          sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
