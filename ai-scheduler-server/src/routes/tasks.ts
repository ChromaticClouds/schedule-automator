import type { FastifyInstance } from 'fastify';
import { TaskModel } from '@/models/index.js';
import {
  createTaskSchema,
  objectIdParamSchema,
  updateTaskSchema,
} from '@/schemas/planning.js';
import {
  taskSummaryQuerySchema,
} from '@/schemas/task-summary.js';
import { getTaskSummary } from '@/services/task-summary.js';
import {
  notFound,
  parseBody,
  parseParams,
  parseQuery,
  requireUserId,
} from '@/core/http/http.js';

export const registerTaskRoutes = async (app: FastifyInstance) => {
  app.get('/tasks/summary', async (request) => {
    const userId = requireUserId(request);
    const query = parseQuery(taskSummaryQuerySchema, request);
    return getTaskSummary(userId, query);
  });

  app.get('/tasks', async (request) => {
    const userId = requireUserId(request);
    return TaskModel.find({ status: { $ne: 'archived' }, userId }).sort({
      createdAt: -1,
    });
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
      { returnDocument: 'after', runValidators: true },
    );

    return task ?? notFound('Task');
  });

  app.post('/tasks/:id/miss', async (request) => {
    const userId = requireUserId(request);
    const { id } = parseParams(objectIdParamSchema, request);
    const task = await TaskModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { status: 'missed' }, $inc: { postponedCount: 1 } },
      { returnDocument: 'after', runValidators: true },
    );

    return task ?? notFound('Task');
  });

  app.delete('/tasks/:id', async (request) => {
    const userId = requireUserId(request);
    const { id } = parseParams(objectIdParamSchema, request);
    const task = await TaskModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { status: 'archived' } },
      { returnDocument: 'after', runValidators: true },
    );

    return task ?? notFound('Task');
  });
};
