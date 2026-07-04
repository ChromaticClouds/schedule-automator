import type { FastifyInstance } from 'fastify';
import { Types } from 'mongoose';
import { objectIdParamSchema } from '@/schemas/planning.js';
import {
  scheduleBlockEditParamsSchema,
  scheduleBlockEditSchema,
  scheduleDraftQuerySchema,
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
import {
  editScheduleDraftBlock,
  ScheduleEditError,
} from '@/services/schedule-edit.js';
import {
  getScheduleDraft,
  rejectScheduleDraft,
  ScheduleLifecycleError,
} from '@/services/schedule-lifecycle.js';
import { GoogleConnectionError } from '@/services/google-client.js';
import {
  HttpError,
  parseBody,
  parseParams,
  parseQuery,
  requireUserId,
} from './http.js';

const mapScheduleError = (error: unknown): never => {
  if (
    error instanceof ScheduleDraftError ||
    error instanceof ScheduleEditError ||
    error instanceof ScheduleApprovalError ||
    error instanceof ScheduleLifecycleError
  ) {
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
  app.get('/schedule-drafts', async (request) => {
    const userId = requireUserId(request);
    const { date } = parseQuery(scheduleDraftQuerySchema, request);

    try {
      return await getScheduleDraft(userId, date);
    } catch (error) {
      return mapScheduleError(error);
    }
  });

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

  app.post('/schedule-drafts/:id/reject', async (request) => {
    const userId = requireUserId(request);
    const { id } = parseParams(objectIdParamSchema, request);

    try {
      return await rejectScheduleDraft(userId, new Types.ObjectId(id));
    } catch (error) {
      return mapScheduleError(error);
    }
  });

  app.patch('/schedule-drafts/:draftId/blocks/:blockId', async (request) => {
    const userId = requireUserId(request);
    const { blockId, draftId } = parseParams(
      scheduleBlockEditParamsSchema,
      request,
    );
    const body = parseBody(scheduleBlockEditSchema, request);

    try {
      return await editScheduleDraftBlock(
        userId,
        new Types.ObjectId(draftId),
        new Types.ObjectId(blockId),
        body,
      );
    } catch (error) {
      return mapScheduleError(error);
    }
  });
};
