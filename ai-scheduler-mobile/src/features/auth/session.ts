import { create } from 'zustand';
import { rawApiRequest } from '@/api/transport';
import {
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
} from './storage';
import {
  AuthSession,
  AuthSessionResponse,
  toAuthSession,
} from './types';

type AuthStatus = 'loading' | 'anonymous' | 'authenticated';
type AuthState = {
  session: AuthSession | null;
  status: AuthStatus;
};

export const useAuthStore = create<AuthState>(() => ({
  session: null,
  status: 'loading',
}));

let activeSession: AuthSession | null = null;
let refreshPromise: Promise<AuthSession | null> | null = null;
let sessionVersion = 0;

const commitSession = (session: AuthSession | null) => {
  sessionVersion += 1;
  activeSession = session;
  useAuthStore.setState({
    session,
    status: session ? 'authenticated' : 'anonymous',
  });
};

export const getAuthSession = () => activeSession;

export const hydrateAuthSession = async () => {
  try {
    commitSession(await readStoredSession());
  } catch {
    commitSession(null);
  }
};

export const saveAuthSession = async (response: AuthSessionResponse) => {
  const session = toAuthSession(response);
  await writeStoredSession(session);
  commitSession(session);
  return session;
};

export const clearAuthSession = async () => {
  try {
    await clearStoredSession();
  } finally {
    commitSession(null);
  }
};

export const refreshAuthSession = () => {
  if (refreshPromise) return refreshPromise;
  const refreshToken = activeSession?.refreshToken;
  if (!refreshToken) return Promise.resolve(null);
  const startedAtVersion = sessionVersion;

  refreshPromise = rawApiRequest<AuthSessionResponse>(
    '/auth/session/refresh',
    { method: 'POST', body: { refreshToken } },
  )
    .then((response) =>
      startedAtVersion === sessionVersion
        ? saveAuthSession(response)
        : null,
    )
    .catch(async () => {
      await clearAuthSession();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

export const logoutAuthSession = async () => {
  const refreshToken = activeSession?.refreshToken;
  try {
    if (refreshToken) {
      await rawApiRequest('/auth/session/logout', {
        method: 'POST',
        body: { refreshToken },
      });
    }
  } catch {
    // Local credentials must still be cleared when the server is unavailable.
  } finally {
    await clearAuthSession();
  }
};
