import type { FastifyInstance } from 'fastify';
import { TaskModel } from '../models/index.js';
import {
  createTaskSchema,
  objectIdParamSchema,
  updateTaskSchema,
} from '../schemas/planning.js';
import { notFound, parseBody, parseParams, requireUserId } from './http.js';

export const registerTaskRoutes = async (app: FastifyInstance) => {
  app.get('/tasks', async (request) => {
    const userId = requireUserId(request);
    return TaskModel.find({ userId }).sort({ createdAt: -1 });
  });

  app.post('/tasks', async (request, reply) => {
    const userId = requireUserId(request);
    const body = parseBody(createTaskSchema, request);
    const task = await TaskModel.create({ ...body, userId });
    return reply.code(201).send(task);
  });

  app.patch('/tasks/:id', async (request) => {
    const userId = requireUserId(request);
    const { id } = parseParams(objectIdParamSchema, request);
    const body = parseBody(updateTaskSchema, request);
    const task = await TaskModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: body },
      { new: true, runValidators: true },
    );

    return task ?? notFound('Task');
  });

  app.post('/tasks/:id/miss', async (request) => {
    const userId = requireUserId(request);
    const { id } = parseParams(objectIdParamSchema, request);
    const task = await TaskModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { status: 'missed' }, $inc: { postponedCount: 1 } },
      { new: true, runValidators: true },
    );

    return task ?? notFound('Task');
  });

  app.delete('/tasks/:id', async (request) => {
    const userId = requireUserId(request);
    const { id } = parseParams(objectIdParamSchema, request);
    const task = await TaskModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { status: 'archived' } },
      { new: true, runValidators: true },
    );

    return task ?? notFound('Task');
  });
};
