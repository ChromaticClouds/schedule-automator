import type { FastifyInstance } from 'fastify';
import { registerGoalRoutes } from './goals.js';
import { registerProtectedTimeRoutes } from './protected-times.js';
import { registerTaskRoutes } from './tasks.js';

export const registerPlanningRoutes = async (app: FastifyInstance) => {
  await registerGoalRoutes(app);
  await registerTaskRoutes(app);
  await registerProtectedTimeRoutes(app);
};
