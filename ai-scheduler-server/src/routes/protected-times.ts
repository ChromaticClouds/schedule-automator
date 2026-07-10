import type { FastifyInstance } from 'fastify';
import { ProtectedTimeModel } from '@/models/index.js';
import {
  createProtectedTimeSchema,
  objectIdParamSchema,
  updateProtectedTimeSchema,
} from '@/schemas/planning.js';
import { notFound, parseBody, parseParams, requireUserId } from '@/core/http/http.js';

export const registerProtectedTimeRoutes = async (app: FastifyInstance) => {
  app.get('/protected-times', async (request) => {
    const userId = requireUserId(request);
    return ProtectedTimeModel.find({ userId }).sort({ createdAt: -1 });
  });

  app.post('/protected-times', async (request, reply) => {
    const userId = requireUserId(request);
    const body = parseBody(createProtectedTimeSchema, request);
    const protectedTime = await ProtectedTimeModel.create({ ...body, userId });
    return reply.code(201).send(protectedTime);
  });

  app.patch('/protected-times/:id', async (request) => {
    const userId = requireUserId(request);
    const { id } = parseParams(objectIdParamSchema, request);
    const body = parseBody(updateProtectedTimeSchema, request);
    const protectedTime = await ProtectedTimeModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: body },
      { returnDocument: 'after', runValidators: true },
    );

    return protectedTime ?? notFound('Protected time');
  });

  app.delete('/protected-times/:id', async (request, reply) => {
    const userId = requireUserId(request);
    const { id } = parseParams(objectIdParamSchema, request);
    const protectedTime = await ProtectedTimeModel.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!protectedTime) {
      return notFound('Protected time');
    }

    return reply.code(204).send();
  });
};
