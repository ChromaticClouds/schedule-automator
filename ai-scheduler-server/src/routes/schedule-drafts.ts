import type { FastifyInstance } from 'fastify';
import { Types } from 'mongoose';
import { objectIdParamSchema } from '@/schemas/planning.js';
import {
  scheduleDraftRequestSchema,
  scheduleIdempotencyKeySchema,
} from '@/schemas/schedule-draft.js';
import {
  approveScheduleDraft,
  ScheduleApprovalError,
} from '@/services/schedule-approval.js';
import {
  generateDailyScheduleDraft,
  ScheduleDraftError,
} from '@/services/schedule-draft.js';
import { GoogleConnectionError } from '@/services/google-client.js';
import { HttpError, parseBody, parseParams, requireUserId } from './http.js';

const mapScheduleError = (error: unknown): never => {
  if (error instanceof ScheduleDraftError || error instanceof ScheduleApprovalError) {
    throw new HttpError(error.message, error.statusCode, {
      code: error.code,
    });
  }
  if (error instanceof GoogleConnectionError) {
    throw new HttpError(error.message, error.statusCode);
  }
  throw error;
};

export const registerScheduleDraftRoutes = async (app: FastifyInstance) => {
  app.post('/schedule-drafts', async (request, reply) => {
    const userId = requireUserId(request);
    const body = parseBody(scheduleDraftRequestSchema, request);
    const key = scheduleIdempotencyKeySchema.safeParse(
      request.headers['idempotency-key'],
    );
    if (!key.success) {
      throw new HttpError('Valid Idempotency-Key header is required', 400);
    }

    try {
      const result = await generateDailyScheduleDraft(
        userId,
        body.date,
        key.data,
      );
      return reply.code(result.replayed ? 200 : 201).send(result);
    } catch (error) {
      return mapScheduleError(error);
    }
  });

  app.post('/schedule-drafts/:id/approve', async (request, reply) => {
    const userId = requireUserId(request);
    const { id } = parseParams(objectIdParamSchema, request);

    try {
      const result = await approveScheduleDraft(
        userId,
        new Types.ObjectId(id),
      );
      return reply.code(result.replayed ? 200 : 201).send(result);
    } catch (error) {
      return mapScheduleError(error);
    }
  });
};
