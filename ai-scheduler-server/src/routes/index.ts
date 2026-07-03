import type { FastifyInstance } from 'fastify';
import { registerCalendarRoutes } from './calendar.js';
import { registerDailyReviewRoutes } from './daily-reviews.js';
import { registerGoalRoutes } from './goals.js';
import { registerGoogleAuthRoutes } from './google-auth.js';
import { registerProtectedTimeRoutes } from './protected-times.js';
import { registerScheduleDraftRoutes } from './schedule-drafts.js';
import { registerTaskRoutes } from './tasks.js';
import { registerTaskBreakdownRoutes } from './task-breakdown.js';

export const registerPlanningRoutes = async (app: FastifyInstance) => {
  await registerGoogleAuthRoutes(app);
  await app.register(async (protectedApp) => {
    protectedApp.addHook('onRequest', async (request) => {
      await request.jwtVerify();
    });

    await registerCalendarRoutes(protectedApp);
    await registerDailyReviewRoutes(protectedApp);
    await registerGoalRoutes(protectedApp);
    await registerScheduleDraftRoutes(protectedApp);
    await registerTaskBreakdownRoutes(protectedApp);
    await registerTaskRoutes(protectedApp);
    await registerProtectedTimeRoutes(protectedApp);
  });
};
