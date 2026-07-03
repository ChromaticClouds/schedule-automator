import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { z } from 'zod';
import { AuthSession } from './types';

const storageKey = 'ai-scheduler.auth-session';
const sessionSchema = z.object({
  accessToken: z.string().min(1),
  expiresAt: z.number().positive(),
  expiresIn: z.number().int().positive(),
  refreshToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
});
let webSession: AuthSession | null = null;

export const readStoredSession = async () => {
  const value =
    Platform.OS === 'web'
      ? webSession
      : await SecureStore.getItemAsync(storageKey);

  if (typeof value !== 'string') return value;

  try {
    return sessionSchema.parse(JSON.parse(value));
  } catch {
    await clearStoredSession();
    return null;
  }
};

export const writeStoredSession = async (session: AuthSession) => {
  if (Platform.OS === 'web') {
    webSession = session;
    return;
  }

  await SecureStore.setItemAsync(storageKey, JSON.stringify(session), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
};

export const clearStoredSession = async () => {
  if (Platform.OS === 'web') {
    webSession = null;
    return;
  }

  await SecureStore.deleteItemAsync(storageKey);
};
