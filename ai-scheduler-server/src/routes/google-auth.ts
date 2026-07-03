import { randomUUID } from 'node:crypto';
import type { FastifyInstance, FastifyReply } from 'fastify';
import {
  createOAuthState,
  verifyOAuthState,
} from '@/auth/security.js';
import { ENV } from '@/config/env.js';
import {
  googleCallbackQuerySchema,
  googleStartQuerySchema,
  refreshSessionSchema,
  sessionExchangeSchema,
} from '@/schemas/google-auth.js';
import {
  consumeAuthHandoff,
  createAuthHandoff,
  createAuthSession,
  revokeAuthSession,
  rotateAuthSession,
} from '@/services/auth-session.js';
import {
  connectGoogleAccount,
  createGoogleAuthorizationUrl,
} from '@/services/google-oauth.js';
import {
  HttpError,
  parseBody,
  parseQuery,
} from './http.js';

const issueSession = async (
  reply: FastifyReply,
  userId: string,
  sessionId: string,
  refreshToken: string,
) => ({
  accessToken: await reply.jwtSign({
    jti: randomUUID(),
    sid: sessionId,
    sub: userId,
    type: 'access',
  }),
  expiresIn: ENV.JWT_ACCESS_TTL_SECONDS,
  refreshToken,
  tokenType: 'Bearer',
});

export const registerGoogleAuthRoutes = async (app: FastifyInstance) => {
  app.get('/auth/google', async (request) => {
    const { codeChallenge } = parseQuery(googleStartQuerySchema, request);
    const state = createOAuthState(codeChallenge, ENV.SESSION_SECRET);

    return {
      authorizationUrl: createGoogleAuthorizationUrl(state),
    };
  });

  app.get('/auth/google/callback', async (request, reply) => {
    const query = parseQuery(googleCallbackQuerySchema, request);
    let state: ReturnType<typeof verifyOAuthState>;

    try {
      state = verifyOAuthState(query.state, ENV.SESSION_SECRET);
    } catch {
      throw new HttpError('Invalid or expired OAuth state', 400);
    }

    if (query.error || !query.code) {
      throw new HttpError('Google authorization was not completed', 400);
    }

    let userId: string;
    try {
      userId = await connectGoogleAccount(query.code);
    } catch {
      request.log.error('Google OAuth callback failed');
      throw new HttpError('Google OAuth connection failed', 502);
    }

    const handoffCode = await createAuthHandoff(
      app.redis,
      userId,
      state.codeChallenge,
    );
    const returnUrl = new URL(ENV.APP_ORIGIN);
    returnUrl.searchParams.set('google', 'connected');
    returnUrl.searchParams.set('handoffCode', handoffCode);
    return reply.redirect(returnUrl.toString());
  });

  app.post('/auth/session/exchange', async (request, reply) => {
    const body = parseBody(sessionExchangeSchema, request);
    const userId = await consumeAuthHandoff(
      app.redis,
      body.code,
      body.codeVerifier,
    );

    if (!userId) {
      throw new HttpError('Invalid or expired handoff code', 400);
    }

    const session = await createAuthSession(app.redis, userId);
    return issueSession(
      reply,
      userId,
      session.sessionId,
      session.token,
    );
  });

  app.post('/auth/session/refresh', async (request, reply) => {
    const { refreshToken } = parseBody(refreshSessionSchema, request);
    const session = await rotateAuthSession(app.redis, refreshToken);

    if (!session) {
      throw new HttpError('Invalid refresh token', 401);
    }

    return issueSession(
      reply,
      session.userId,
      session.sessionId,
      session.refreshToken,
    );
  });

  app.post('/auth/session/logout', async (request, reply) => {
    const { refreshToken } = parseBody(refreshSessionSchema, request);
    await revokeAuthSession(app.redis, refreshToken);
    return reply.code(204).send();
  });
};
