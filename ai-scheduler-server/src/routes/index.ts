import type { FastifyInstance } from 'fastify';
import type { ScheduleDraftDependencies } from '@/features/schedule-drafts/schedule-contract.js';
import { registerCalendarRoutes } from '@/features/calendar/calendar.routes.js';
import { registerDailyReviewRoutes } from '@/features/daily-review/daily-reviews.routes.js';
import { registerGoalRoutes } from './goals.js';
import { registerGoogleAuthRoutes } from './google-auth.js';
import { registerProtectedTimeRoutes } from './protected-times.js';
import { registerScheduleDraftRoutes } from '@/features/schedule-drafts/schedule-drafts.routes.js';
import { registerSchedulePreferenceRoutes } from './schedule-preferences.js';
import { registerTaskRoutes } from './tasks.js';
import { registerTaskBreakdownRoutes } from '@/features/task-breakdown/task-breakdown.routes.js';
import { registerWeeklyRescheduleRoutes } from '@/features/weekly-reschedule/weekly-reschedules.routes.js';

export const registerPlanningRoutes = async (
  app: FastifyInstance,
  scheduleDraftDependencies: ScheduleDraftDependencies = {},
) => {
  await registerGoogleAuthRoutes(app);
  await app.register(async (protectedApp) => {
    protectedApp.addHook('onRequest', async (request) => {
      await request.jwtVerify();
    });

    await registerCalendarRoutes(protectedApp);
    await registerDailyReviewRoutes(protectedApp);
    await registerGoalRoutes(protectedApp);
    await registerScheduleDraftRoutes(protectedApp, scheduleDraftDependencies);
    await registerSchedulePreferenceRoutes(protectedApp);
    await registerTaskBreakdownRoutes(protectedApp);
    await registerTaskRoutes(protectedApp);
    await registerProtectedTimeRoutes(protectedApp);
    await registerWeeklyRescheduleRoutes(protectedApp);
  });
};
