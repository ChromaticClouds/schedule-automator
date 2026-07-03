import type { FastifyInstance } from 'fastify';
import { registerGoalRoutes } from './goals.js';
import { registerGoogleAuthRoutes } from './google-auth.js';
import { registerProtectedTimeRoutes } from './protected-times.js';
import { registerTaskRoutes } from './tasks.js';

export const registerPlanningRoutes = async (app: FastifyInstance) => {
  await registerGoogleAuthRoutes(app);
  await app.register(async (protectedApp) => {
    protectedApp.addHook('onRequest', async (request) => {
      await request.jwtVerify();
    });

    await registerGoalRoutes(protectedApp);
    await registerTaskRoutes(protectedApp);
    await registerProtectedTimeRoutes(protectedApp);
  });
};
