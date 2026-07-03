import type { FastifyInstance } from 'fastify';
import { GoalModel } from '../models/index.js';
import {
  createGoalSchema,
  objectIdParamSchema,
  updateGoalSchema,
} from '../schemas/planning.js';
import { notFound, parseBody, parseParams, requireUserId } from './http.js';

export const registerGoalRoutes = async (app: FastifyInstance) => {
  app.get('/goals', async (request) => {
    const userId = requireUserId(request);
    return GoalModel.find({ userId }).sort({ createdAt: -1 });
  });

  app.post('/goals', async (request, reply) => {
    const userId = requireUserId(request);
    const body = parseBody(createGoalSchema, request);
    const goal = await GoalModel.create({ ...body, userId });
    return reply.code(201).send(goal);
  });

  app.patch('/goals/:id', async (request) => {
    const userId = requireUserId(request);
    const { id } = parseParams(objectIdParamSchema, request);
    const body = parseBody(updateGoalSchema, request);
    const goal = await GoalModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: body },
      { new: true, runValidators: true },
    );

    return goal ?? notFound('Goal');
  });

  app.delete('/goals/:id', async (request) => {
    const userId = requireUserId(request);
    const { id } = parseParams(objectIdParamSchema, request);
    const goal = await GoalModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { status: 'archived' } },
      { new: true, runValidators: true },
    );

    return goal ?? notFound('Goal');
  });
};
