import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { CORS_ORIGINS } from './config/env.js';

export const buildApp = async () => {
  const app = Fastify({ logger: true });

  await app.register(helmet);

  await app.register(cors, {
    origin: CORS_ORIGINS,
    credentials: true,
  });

  app.get('/health', async () => ({
    ok: true,
    service: 'ai-scheduler-server',
  }));

  return app;
};
