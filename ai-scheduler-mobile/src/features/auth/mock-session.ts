import { rawApiRequest } from '@/api/transport';
import { ENV } from '@/config';
import type { AuthSessionResponse } from './types';

export const loadMockAuthSession = () => {
  if (ENV.APP_ENV !== 'test' || !ENV.ENABLE_MOCK_AUTH) {
    return Promise.resolve(null);
  }

  return rawApiRequest<AuthSessionResponse>('/auth/e2e-session', {
    method: 'POST',
  });
};
