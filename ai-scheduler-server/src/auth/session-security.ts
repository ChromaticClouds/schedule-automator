import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

const base64UrlPattern = /^[A-Za-z0-9_-]+$/;

export const createOpaqueToken = (bytes = 32) =>
  randomBytes(bytes).toString('base64url');

export const hashAuthToken = (value: string, pepper: string) =>
  createHmac('sha256', pepper).update(value).digest('base64url');

export const createCodeChallenge = (verifier: string) =>
  createHash('sha256').update(verifier).digest('base64url');

export const verifyCodeChallenge = (
  verifier: string,
  expectedChallenge: string,
) => {
  const actual = Buffer.from(createCodeChallenge(verifier));
  const expected = Buffer.from(expectedChallenge);

  return (
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
};

export const createRefreshCredential = (pepper: string) => {
  const sessionId = createOpaqueToken(18);
  const secret = createOpaqueToken();

  return {
    hash: hashAuthToken(secret, pepper),
    secret,
    sessionId,
    token: `${sessionId}.${secret}`,
  };
};

export const rotateRefreshCredential = (
  sessionId: string,
  pepper: string,
) => {
  const secret = createOpaqueToken();

  return {
    hash: hashAuthToken(secret, pepper),
    token: `${sessionId}.${secret}`,
  };
};

export const parseRefreshCredential = (token: string) => {
  const parts = token.split('.');

  if (
    parts.length !== 2 ||
    parts.some(
      (part) =>
        part.length < 20 ||
        part.length > 128 ||
        !base64UrlPattern.test(part),
    )
  ) {
    return null;
  }

  return {
    secret: parts[1],
    sessionId: parts[0],
  };
};
