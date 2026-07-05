import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { rawApiRequest } from '@/api/transport';
import { saveAuthSession } from './session';
import { AuthSessionResponse } from './types';

WebBrowser.maybeCompleteAuthSession();

const toBase64Url = (value: string) =>
  value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const createPkcePair = async () => {
  const verifier = `${Crypto.randomUUID()}${Crypto.randomUUID()}`.replace(
    /-/g,
    '',
  );
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );
  return { verifier, challenge: toBase64Url(digest) };
};

export const signInWithGoogle = async () => {
  const { verifier, challenge } = await createPkcePair();
  const redirectUrl = Linking.createURL('/');
  const start = await rawApiRequest<{ authorizationUrl: string }>(
    `/auth/google?codeChallenge=${encodeURIComponent(
      challenge,
    )}&returnTo=${encodeURIComponent(redirectUrl)}`,
  );
  const result = await WebBrowser.openAuthSessionAsync(
    start.authorizationUrl,
    redirectUrl,
  );

  if (result.type !== 'success') return false;

  const callback = new URL(result.url);
  const handoffCode = callback.searchParams.get('handoffCode');
  if (!handoffCode || callback.searchParams.get('google') !== 'connected') {
    throw new Error('Google 인증 콜백이 완료되지 않았습니다.');
  }

  const session = await rawApiRequest<AuthSessionResponse>(
    '/auth/session/exchange',
    {
      method: 'POST',
      body: { code: handoffCode, codeVerifier: verifier },
    },
  );
  await saveAuthSession(session, undefined, { resetAuthCache: true });
  return true;
};
