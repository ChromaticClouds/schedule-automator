import {
  getAuthSession,
  refreshAuthSession,
} from '@/features/auth/session';
import { ApiError, ApiOptions, rawApiRequest } from './transport';

const authorizedOptions = (
  options: ApiOptions,
  accessToken: string,
): ApiOptions => {
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  return { ...options, headers };
};

export const apiRequest = async <T>(
  path: string,
  options: ApiOptions = {},
) => {
  const session = getAuthSession();
  if (!session) throw new ApiError('Authentication required', 401);

  try {
    return await rawApiRequest<T>(
      path,
      authorizedOptions(options, session.accessToken),
    );
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
  }

  const refreshed = await refreshAuthSession();
  if (!refreshed) throw new ApiError('Session expired', 401);
  return rawApiRequest<T>(
    path,
    authorizedOptions(options, refreshed.accessToken),
  );
};

export type HealthResponse = {
  ok: boolean;
  service: string;
};

export const getHealth = () => rawApiRequest<HealthResponse>('/health');

export { ApiError } from './transport';
