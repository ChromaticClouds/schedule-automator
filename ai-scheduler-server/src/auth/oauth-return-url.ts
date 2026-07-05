import { ENV } from '@/config/env.js';

const expoProtocols = new Set(['exp:', 'exps:']);

export const canRedirectToOAuthReturnUrl = (returnTo: string) => {
  const url = new URL(returnTo);
  const appOrigin = new URL(ENV.APP_ORIGIN);

  if (url.protocol === appOrigin.protocol) return true;
  return ENV.NODE_ENV !== 'production' && expoProtocols.has(url.protocol);
};

export const resolveOAuthReturnUrl = (returnTo: string | undefined) => {
  if (!returnTo) return new URL(ENV.APP_ORIGIN);
  return new URL(returnTo);
};
