import type { FastifyInstance } from 'fastify';
import { TaskModel } from '@/models/index.js';
import {
  createTaskSchema,
  objectIdParamSchema,
  updateTaskSchema,
} from '@/schemas/planning.js';
import {
  taskSummaryQuerySchema,
  taskSummaryResponseSchema,
} from '@/schemas/task-summary.js';
import {
  notFound,
  parseBody,
  parseParams,
  parseQuery,
  requireUserId,
} from './http.js';

const dayStart = (date: string) => new Date(`${date}T00:00:00.000Z`);
const dayEnd = (date: string) => new Date(`${date}T23:59:59.999Z`);

export const registerTaskRoutes = async (app: FastifyInstance) => {
  app.get('/tasks/summary', async (request) => {
    const userId = requireUserId(request);
    const query = parseQuery(taskSummaryQuerySchema, request);
    const filter: {
      deadline?: { $gte?: Date; $lte?: Date };
      status: { $in: typeof query.statuses };
      userId: typeof userId;
    } = {
      status: { $in: query.statuses },
      userId,
    };

    if (query.from || query.to) {
      filter.deadline = {};
      if (query.from) filter.deadline.$gte = dayStart(query.from);
      if (query.to) filter.deadline.$lte = dayEnd(query.to);
    }

    const tasks = await TaskModel.find(filter)
      .select({ deadline: 1, estimatedMinutes: 1, status: 1, title: 1 })
      .sort({ deadline: 1, createdAt: -1 })
      .limit(query.limit)
      .lean();
    const byStatus = Object.fromEntries(
      query.statuses.map((status) => [
        status,
        { count: 0, estimatedMinutes: 0 },
      ]),
    );
    const items = tasks.map((task) => {
      byStatus[task.status].count += 1;
      byStatus[task.status].estimatedMinutes += task.estimatedMinutes;
      return {
        _id: task._id.toString(),
        deadline: task.deadline?.toISOString(),
        estimatedMinutes: task.estimatedMinutes,
        status: task.status,
        title: task.title,
      };
    });

    return taskSummaryResponseSchema.parse({
      byStatus,
      range: { from: query.from, to: query.to },
      statuses: query.statuses,
      tasks: items,
      totals: {
        count: items.length,
        estimatedMinutes: items.reduce(
          (sum, task) => sum + task.estimatedMinutes,
          0,
        ),
      },
    });
  });

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
