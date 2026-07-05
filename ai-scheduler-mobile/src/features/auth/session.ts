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
import { loadMockAuthSession } from './mock-session';

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
let storageMutation = Promise.resolve();
let resetAuthCache = () => {};

type SaveAuthSessionOptions = {
  resetAuthCache?: boolean;
};

const mutateStoredSession = <T>(operation: () => Promise<T>) => {
  const result = storageMutation.then(operation, operation);
  storageMutation = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
};

const commitSession = (
  session: AuthSession | null,
  options: SaveAuthSessionOptions = {},
) => {
  const crossedAuthBoundary = Boolean(activeSession) !== Boolean(session);
  sessionVersion += 1;
  activeSession = session;
  if (crossedAuthBoundary || options.resetAuthCache) resetAuthCache();
  useAuthStore.setState({
    session,
    status: session ? 'authenticated' : 'anonymous',
  });
};

export const registerAuthCacheReset = (reset: () => void) => {
  resetAuthCache = reset;
  return () => {
    if (resetAuthCache === reset) resetAuthCache = () => {};
  };
};

export const getAuthSession = () => activeSession;

export const hydrateAuthSession = async () => {
  try {
    let session = await readStoredSession();
    if (!session) {
      const mockResponse = await loadMockAuthSession();
      session = mockResponse ? toAuthSession(mockResponse) : null;
      if (session) await writeStoredSession(session);
    }
    commitSession(session);
  } catch {
    commitSession(null);
  }
};

export const saveAuthSession = (
  response: AuthSessionResponse,
  expectedVersion?: number,
  options?: SaveAuthSessionOptions,
) => mutateStoredSession(async () => {
  if (
    expectedVersion !== undefined &&
    expectedVersion !== sessionVersion
  ) {
    return null;
  }
  const session = toAuthSession(response);
  await writeStoredSession(session);
  commitSession(session, options);
  return session;
});

export const clearAuthSession = (expectedVersion?: number) =>
  mutateStoredSession(async () => {
    if (
      expectedVersion !== undefined &&
      expectedVersion !== sessionVersion
    ) {
      return false;
    }
    try {
      await clearStoredSession();
    } finally {
      commitSession(null);
    }
    return true;
  });

export const refreshAuthSession = () => {
  if (refreshPromise) return refreshPromise;
  const refreshToken = activeSession?.refreshToken;
  if (!refreshToken) return Promise.resolve(null);
  const startedAtVersion = sessionVersion;

  refreshPromise = rawApiRequest<AuthSessionResponse>(
    '/auth/session/refresh',
    { method: 'POST', body: { refreshToken } },
  )
    .then((response) => saveAuthSession(response, startedAtVersion))
    .catch(async () => {
      await clearAuthSession(startedAtVersion);
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

export const logoutAuthSession = async () => {
  const refreshToken = activeSession?.refreshToken;
  const revokePromise = refreshToken
    ? rawApiRequest('/auth/session/logout', {
        method: 'POST',
        body: { refreshToken },
      }).catch(() => undefined)
    : Promise.resolve();

  await clearAuthSession();
  await revokePromise;
};
