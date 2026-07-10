import type { FastifyInstance } from 'fastify';
import {
  createOpaqueToken,
  createRefreshCredential,
  hashAuthToken,
  parseRefreshCredential,
  rotateRefreshCredential,
  verifyCodeChallenge,
} from '@/core/auth/session-security.js';
import { ENV } from '@/core/config/env.js';
import {
  consumeHandoffScript,
  revokeSessionScript,
  rotateSessionScript,
} from './auth-session-scripts.js';

type RedisClient = FastifyInstance['redis'];

const handoffKey = (code: string) =>
  `${ENV.REDIS_KEY_PREFIX}auth:handoff:${hashAuthToken(
    code,
    ENV.REFRESH_TOKEN_PEPPER,
  )}`;

const sessionKey = (sessionId: string) =>
  `${ENV.REDIS_KEY_PREFIX}auth:session:${sessionId}`;

export const createAuthHandoff = async (
  redis: RedisClient,
  userId: string,
  codeChallenge: string,
) => {
  const code = createOpaqueToken();
  await redis.set(
    handoffKey(code),
    JSON.stringify({ codeChallenge, userId }),
    'EX',
    ENV.AUTH_HANDOFF_TTL_SECONDS,
  );
  return code;
};

export const consumeAuthHandoff = async (
  redis: RedisClient,
  code: string,
  codeVerifier: string,
) => {
  const raw = await redis.eval(
    consumeHandoffScript,
    1,
    handoffKey(code),
  );

  if (typeof raw !== 'string') {
    return null;
  }

  let value: { codeChallenge?: unknown; userId?: unknown };
  try {
    value = JSON.parse(raw) as typeof value;
  } catch {
    return null;
  }

  if (
    typeof value.codeChallenge !== 'string' ||
    typeof value.userId !== 'string' ||
    !verifyCodeChallenge(codeVerifier, value.codeChallenge)
  ) {
    return null;
  }

  return value.userId;
};

export const createAuthSession = async (
  redis: RedisClient,
  userId: string,
) => {
  const credential = createRefreshCredential(ENV.REFRESH_TOKEN_PEPPER);
  await redis
    .multi()
    .hset(
      sessionKey(credential.sessionId),
      'userId',
      userId,
      'refreshHash',
      credential.hash,
    )
    .expire(
      sessionKey(credential.sessionId),
      ENV.AUTH_REFRESH_TTL_SECONDS,
    )
    .exec();

  return credential;
};

export const rotateAuthSession = async (
  redis: RedisClient,
  token: string,
) => {
  const current = parseRefreshCredential(token);
  if (!current) return null;

  const next = rotateRefreshCredential(
    current.sessionId,
    ENV.REFRESH_TOKEN_PEPPER,
  );
  const result = await redis.eval(
    rotateSessionScript,
    1,
    sessionKey(current.sessionId),
    hashAuthToken(current.secret, ENV.REFRESH_TOKEN_PEPPER),
    next.hash,
    ENV.AUTH_REFRESH_TTL_SECONDS,
  );

  if (!Array.isArray(result) || Number(result[0]) !== 1) {
    return null;
  }

  return {
    refreshToken: next.token,
    sessionId: current.sessionId,
    userId: String(result[1]),
  };
};

export const revokeAuthSession = async (
  redis: RedisClient,
  token: string,
) => {
  const credential = parseRefreshCredential(token);
  if (!credential) return false;

  const result = await redis.eval(
    revokeSessionScript,
    1,
    sessionKey(credential.sessionId),
    hashAuthToken(credential.secret, ENV.REFRESH_TOKEN_PEPPER),
  );

  return Number(result) === 1;
};
