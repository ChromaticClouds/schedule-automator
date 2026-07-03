import type { FastifyInstance } from 'fastify';
import { Types } from 'mongoose';
import {
  idempotencyKeySchema,
  taskBreakdownParamsSchema,
} from '@/schemas/task-breakdown.js';
import {
  generateTaskBreakdown,
  TaskBreakdownError,
} from '@/services/task-breakdown.js';
import { HttpError, parseParams, requireUserId } from './http.js';

export const registerTaskBreakdownRoutes = async (app: FastifyInstance) => {
  app.post('/goals/:goalId/task-breakdown', async (request, reply) => {
    const userId = requireUserId(request);
    const { goalId } = parseParams(taskBreakdownParamsSchema, request);
    const keyResult = idempotencyKeySchema.safeParse(
      request.headers['idempotency-key'],
    );
    if (!keyResult.success) {
      throw new HttpError('Valid Idempotency-Key header is required', 400);
    }

    try {
      const result = await generateTaskBreakdown(
        userId,
        new Types.ObjectId(goalId),
        keyResult.data,
      );
      return reply.code(result.replayed ? 200 : 201).send(result);
    } catch (error) {
      if (error instanceof TaskBreakdownError) {
        throw new HttpError(error.message, error.statusCode, {
          code: error.code,
        });
      }
      throw error;
    }
  });
};
