import type { FastifyInstance } from 'fastify';
import { Types } from 'mongoose';
import {
  createOAuthState,
  verifyOAuthState,
} from '../auth/security.js';
import { ENV } from '../config/env.js';
import { googleCallbackQuerySchema } from '../schemas/google-auth.js';
import {
  connectGoogleAccount,
  createGoogleAuthorizationUrl,
} from '../services/google-oauth.js';
import {
  HttpError,
  parseQuery,
  requireUserId,
} from './http.js';

export const registerGoogleAuthRoutes = async (app: FastifyInstance) => {
  app.get('/auth/google', async (request) => {
    const userId = requireUserId(request);
    const state = createOAuthState(
      userId.toHexString(),
      ENV.SESSION_SECRET,
    );

    return {
      authorizationUrl: createGoogleAuthorizationUrl(state),
    };
  });

  app.get('/auth/google/callback', async (request, reply) => {
    const query = parseQuery(googleCallbackQuerySchema, request);
    let userId: string;

    try {
      userId = verifyOAuthState(
        query.state,
        ENV.SESSION_SECRET,
      ).userId;
    } catch {
      throw new HttpError('Invalid or expired OAuth state', 400);
    }

    if (query.error || !query.code) {
      throw new HttpError('Google authorization was not completed', 400);
    }

    try {
      await connectGoogleAccount(new Types.ObjectId(userId), query.code);
    } catch {
      request.log.error('Google OAuth callback failed');
      throw new HttpError('Google OAuth connection failed', 502);
    }

    const returnUrl = new URL(ENV.APP_ORIGIN);
    returnUrl.searchParams.set('google', 'connected');
    return reply.redirect(returnUrl.toString());
  });
};
