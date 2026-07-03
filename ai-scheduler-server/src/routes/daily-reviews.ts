import type { FastifyInstance } from 'fastify';
import {
  dailyReviewParamsSchema,
  dailyReviewQuerySchema,
  saveDailyReviewSchema,
} from '@/schemas/daily-review.js';
import {
  DailyReviewError,
  getDailyReview,
  saveDailyReview,
} from '@/services/daily-review.js';
import {
  HttpError,
  parseBody,
  parseParams,
  parseQuery,
  requireUserId,
} from './http.js';

const mapReviewError = (error: unknown): never => {
  if (error instanceof DailyReviewError) {
    throw new HttpError(error.message, error.statusCode, {
      code: error.code,
    });
  }
  throw error;
};

export const registerDailyReviewRoutes = async (app: FastifyInstance) => {
  app.get('/daily-reviews', async (request) => {
    const userId = requireUserId(request);
    const { date } = parseQuery(dailyReviewQuerySchema, request);
    return getDailyReview(userId, date);
  });

  app.put('/daily-reviews/:date', async (request) => {
    const userId = requireUserId(request);
    const { date } = parseParams(dailyReviewParamsSchema, request);
    const input = parseBody(saveDailyReviewSchema, request);
    try {
      return await saveDailyReview(userId, date, input);
    } catch (error) {
      return mapReviewError(error);
    }
  });
};
