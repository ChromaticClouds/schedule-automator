import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import redis from '@fastify/redis';
import { CORS_ORIGINS, ENV } from '@/core/config/env.js';
import { HttpError } from '@/core/http/http.js';
import { registerPlanningRoutes } from '@/routes/index.js';
import type { ScheduleDraftDependencies } from '@/features/schedule-drafts/schedule-contract.js';

type BuildAppOptions = {
  scheduleDraftDependencies?: ScheduleDraftDependencies;
};

export const buildApp = async (options: BuildAppOptions = {}) => {
  const app = Fastify({ logger: true });

  await app.register(jwt, {
    secret: ENV.JWT_SECRET,
    sign: {
      aud: ENV.JWT_AUDIENCE,
      expiresIn: ENV.JWT_ACCESS_TTL_SECONDS,
      iss: ENV.JWT_ISSUER,
    },
    verify: {
      allowedAud: ENV.JWT_AUDIENCE,
      allowedIss: ENV.JWT_ISSUER,
    },
  });

  await app.register(redis, {
    closeClient: true,
    url: ENV.REDIS_URL,
  });

  await app.register(helmet);

  await app.register(cors, {
    origin: CORS_ORIGINS,
    credentials: true,
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof HttpError) {
      request.log.warn({ error }, 'request validation failed');
      return reply.code(error.statusCode).send({
        error: error.message,
        details: error.details,
      });
    }

    const errorCode =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
        ? error.code
        : undefined;

    if (errorCode?.startsWith('FST_JWT_')) {
      request.log.warn({ code: errorCode }, 'access token rejected');
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    request.log.error(error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  });

  app.get('/health', async () => ({
    ok: true,
    service: 'ai-scheduler-server',
  }));

  await registerPlanningRoutes(app, options.scheduleDraftDependencies);

  return app;
};
