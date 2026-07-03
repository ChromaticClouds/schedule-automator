import type { FastifyInstance } from 'fastify';
import { idempotencyHeadersSchema } from '@/schemas/gemini.js';
import { objectIdParamSchema } from '@/schemas/planning.js';
import {
  createTaskBreakdown,
  TaskBreakdownError,
} from '@/services/task-breakdown.js';
import { HttpError, parseParams, requireUserId } from './http.js';

export const registerTaskBreakdownRoutes = async (app: FastifyInstance) => {
  app.post('/goals/:id/task-breakdown', async (request, reply) => {
    const userId = requireUserId(request);
    const { id } = parseParams(objectIdParamSchema, request);
    const headers = idempotencyHeadersSchema.safeParse(request.headers);

    if (!headers.success) {
      throw new HttpError('Valid Idempotency-Key header is required', 400);
    }

    try {
      const result = await createTaskBreakdown(
        userId,
        id,
        headers.data['idempotency-key'],
      );
      return reply.code(201).send(result);
    } catch (error) {
      if (error instanceof TaskBreakdownError) {
        throw new HttpError(error.message, error.statusCode);
      }
      throw error;
    }
  });
};
