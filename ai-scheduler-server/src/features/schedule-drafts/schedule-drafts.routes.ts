import type { FastifyInstance } from 'fastify';
import { Types } from 'mongoose';
import { objectIdParamSchema } from '@/schemas/planning.js';
import {
  scheduleBlockEditParamsSchema,
  scheduleBlockEditSchema,
  scheduleDraftQuerySchema,
  scheduleDraftRequestSchema,
} from './schedule-draft.schema.js';
import { approveScheduleDraft } from './schedule-approval.js';
import { generateDailyScheduleDraft } from './schedule-draft.js';
import type { ScheduleDraftDependencies } from './schedule-contract.js';
import { editScheduleDraftBlock } from './schedule-edit.js';
import {
  getScheduleDraft,
  rejectScheduleDraft,
} from './schedule-lifecycle.js';
import { regenerateScheduleDraft } from './schedule-regenerate.js';
import {
  parseBody,
  parseParams,
  parseQuery,
  requireUserId,
} from '@/core/http/http.js';
import {
  mapScheduleError,
  requireIdempotencyKey,
} from './schedule-draft-route-utils.js';

export const registerScheduleDraftRoutes = async (
  app: FastifyInstance,
  dependencies: ScheduleDraftDependencies = {},
) => {
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
    const key = requireIdempotencyKey(request);

    try {
      const result = await generateDailyScheduleDraft(
        userId,
        body.date,
        key,
        dependencies.generator,
        dependencies.contextBuilder,
        body.instruction,
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

  app.post('/schedule-drafts/:id/regenerate', async (request, reply) => {
    const userId = requireUserId(request);
    const { id } = parseParams(objectIdParamSchema, request);
    const key = requireIdempotencyKey(request);

    try {
      const result = await regenerateScheduleDraft(
        userId,
        new Types.ObjectId(id),
        key,
      );
      return reply.code(result.replayed ? 200 : 201).send(result);
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
