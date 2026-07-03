import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { CORS_ORIGINS } from './config/env.js';
import { HttpError } from './routes/http.js';
import { registerPlanningRoutes } from './routes/index.js';

export const buildApp = async () => {
  const app = Fastify({ logger: true });

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

    request.log.error(error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  });

  app.get('/health', async () => ({
    ok: true,
    service: 'ai-scheduler-server',
  }));

  await registerPlanningRoutes(app);

  return app;
};
