import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthBootstrap } from '@/components/auth-bootstrap';
import { QueryProvider } from '@/components/query-provider';
import { ToastProvider } from '@/components/toast-provider';
import '@/config/env';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const mode = colorScheme === 'dark' ? 'dark' : 'light';
  const appTheme = Colors[mode];
  const paperBaseTheme = mode === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const paperTheme = {
    ...paperBaseTheme,
    colors: {
      ...paperBaseTheme.colors,
      background: appTheme.background,
      error: appTheme.danger,
      onPrimary: appTheme.primaryText,
      onSurface: appTheme.text,
      outline: appTheme.border,
      primary: appTheme.primary,
      surface: appTheme.backgroundElement,
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PaperProvider theme={paperTheme}>
        <QueryProvider>
          <AuthBootstrap>
            <ToastProvider>
              <AnimatedSplashOverlay />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="planning-preview" />
              </Stack>
            </ToastProvider>
          </AuthBootstrap>
        </QueryProvider>
      </PaperProvider>
    </ThemeProvider>
  );
}
