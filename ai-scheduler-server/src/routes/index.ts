import type { FastifyInstance } from 'fastify';
import { registerGoalRoutes } from './goals.js';
import { registerGoogleAuthRoutes } from './google-auth.js';
import { registerProtectedTimeRoutes } from './protected-times.js';
import { registerTaskRoutes } from './tasks.js';

export const registerPlanningRoutes = async (app: FastifyInstance) => {
  await registerGoogleAuthRoutes(app);
  await registerGoalRoutes(app);
  await registerTaskRoutes(app);
  await registerProtectedTimeRoutes(app);
};
