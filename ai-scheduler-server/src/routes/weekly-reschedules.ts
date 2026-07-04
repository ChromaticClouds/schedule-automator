import type { FastifyInstance } from 'fastify';
import {
  weeklyRescheduleIdempotencyKeySchema,
  weeklyRescheduleRequestSchema,
} from '@/schemas/weekly-reschedule.js';
import {
  rescheduleMissedTasks,
  WeeklyRescheduleError,
} from '@/services/weekly-reschedule.js';
import { GoogleConnectionError } from '@/services/google-client.js';
import { HttpError, parseBody, requireUserId } from './http.js';

const mapRescheduleError = (error: unknown): never => {
  if (error instanceof WeeklyRescheduleError) {
    throw new HttpError(error.message, error.statusCode, {
      code: error.code,
    });
  }
  if (error instanceof GoogleConnectionError) {
    throw new HttpError(error.message, error.statusCode);
  }
  throw error;
};

export const registerWeeklyRescheduleRoutes = async (
  app: FastifyInstance,
) => {
  app.post('/weekly-reschedules', async (request, reply) => {
    const userId = requireUserId(request);
    const { reviewDate } = parseBody(weeklyRescheduleRequestSchema, request);
    const key = weeklyRescheduleIdempotencyKeySchema.safeParse(
      request.headers['idempotency-key'],
    );
    if (!key.success) {
      throw new HttpError('Valid Idempotency-Key header is required', 400);
    }
    try {
      const result = await rescheduleMissedTasks(
        userId,
        reviewDate,
        key.data,
      );
      return reply.code(result.replayed ? 200 : 201).send(result);
    } catch (error) {
      return mapRescheduleError(error);
    }
  });
};
