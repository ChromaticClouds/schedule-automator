import { randomUUID } from 'node:crypto';
import { buildApp } from '../dist/app.js';
import { connectMongo, disconnectMongo } from '../dist/core/db/connection.js';
import {
  AiRequestLogModel,
  DailyReviewModel,
  GoalModel,
  ProtectedTimeModel,
  ScheduleDraftModel,
  TaskModel,
  UserModel,
} from '../dist/models/index.js';
import { zonedDateTime } from '../dist/shared/time/schedule-time.js';

const runId = randomUUID();
const userIds = [];
let sessionIndex = 0;

const contextBuilder = async (userId, date) => {
  const tasks = await TaskModel.find({ status: 'todo', userId }).lean();
  return {
    busy: [],
    date,
    maxDailyWorkMinutes: 480,
    protected: [],
    tasks: tasks.map((task) => ({
      estimatedMinutes: task.estimatedMinutes,
      id: task._id.toString(),
      importance: task.importance,
      title: task.title,
    })),
    timezone: 'Asia/Seoul',
  };
};

const generator = {
  async generate(context) {
    const task = context.tasks[0];
    if (!task) throw new Error('E2E schedule requires a task');
    return {
      blocks: [{
        end: zonedDateTime(context.date, '10:00:00.000', context.timezone),
        start: zonedDateTime(context.date, '09:00:00.000', context.timezone),
        taskId: task.id,
        title: task.title,
        type: 'task',
      }],
      summary: 'Browser E2E schedule draft',
    };
  },
};

await connectMongo();
const app = await buildApp({
  scheduleDraftDependencies: { contextBuilder, generator },
});

app.post('/auth/e2e-session', async () => {
  sessionIndex += 1;
  const user = await UserModel.create({
    email: `${runId}-${sessionIndex}@example.com`,
    timezone: 'Asia/Seoul',
  });
  userIds.push(user._id);
  const sessionId = `${runId}-${sessionIndex}`;
  return {
    accessToken: app.jwt.sign({
      jti: randomUUID(),
      sid: sessionId,
      sub: user._id.toString(),
      type: 'access',
    }),
    expiresIn: 3600,
    refreshToken: `e2e.${sessionId}.${randomUUID()}`,
    tokenType: 'Bearer',
  };
});

const cleanup = async () => {
  await Promise.all([
    AiRequestLogModel.deleteMany({ userId: { $in: userIds } }),
    DailyReviewModel.deleteMany({ userId: { $in: userIds } }),
    GoalModel.deleteMany({ userId: { $in: userIds } }),
    ProtectedTimeModel.deleteMany({ userId: { $in: userIds } }),
    ScheduleDraftModel.deleteMany({ userId: { $in: userIds } }),
    TaskModel.deleteMany({ userId: { $in: userIds } }),
    UserModel.deleteMany({ _id: { $in: userIds } }),
  ]).catch(() => undefined);
  await app.close().catch(() => undefined);
  await disconnectMongo().catch(() => undefined);
};

process.once('SIGINT', () => void cleanup().finally(() => process.exit()));
process.once('SIGTERM', () => void cleanup().finally(() => process.exit()));

await app.listen({
  host: '127.0.0.1',
  port: Number(process.env.PORT ?? 3100),
});
