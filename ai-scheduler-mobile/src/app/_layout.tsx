import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { AuthBootstrap } from '@/components/auth-bootstrap';
import { QueryProvider } from '@/components/query-provider';
import '@/config/env';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryProvider>
        <AuthBootstrap>
          <AnimatedSplashOverlay />
          <AppTabs />
        </AuthBootstrap>
      </QueryProvider>
    </ThemeProvider>
  );
}
