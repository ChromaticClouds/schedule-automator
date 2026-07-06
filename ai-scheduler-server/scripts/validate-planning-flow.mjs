import { strict as assert } from 'node:assert';
import { randomUUID } from 'node:crypto';
import { buildApp } from '../dist/app.js';
import { connectMongo, disconnectMongo } from '../dist/db/connection.js';
import {
  AiRequestLogModel,
  GoalModel,
  ScheduleDraftModel,
  TaskModel,
  UserModel,
} from '../dist/models/index.js';
import { createDeterministicScheduleGenerator } from
  '../dist/services/schedule-contract.js';
import { zonedDateTime } from '../dist/shared/time/schedule-time.js';
const runId = randomUUID(), date = '2026-07-06', userIds = [];
let app;
const authHeaders = (token) => ({ authorization: `Bearer ${token}` });
const json = (response) => response.json();
try {
  await connectMongo();
  await Promise.all([
    AiRequestLogModel.init(),
    ScheduleDraftModel.init(),
    UserModel.init(),
  ]);
  const users = await UserModel.create([
    { email: `${runId}-owner@example.com`, timezone: 'Asia/Seoul' },
    { email: `${runId}-other@example.com`, timezone: 'Asia/Seoul' },
  ]);
  userIds.push(...users.map(({ _id }) => _id));
  const contextBuilder = async (userId, scheduleDate) => {
    const tasks = await TaskModel.find({ status: 'todo', userId }).lean();
    return {
      busy: [],
      date: scheduleDate,
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
      return createDeterministicScheduleGenerator({
        blocks: [{
          end: zonedDateTime(context.date, '10:00:00.000', context.timezone),
          start: zonedDateTime(context.date, '09:00:00.000', context.timezone),
          taskId: task.id,
          title: task.title,
          type: 'task',
        }],
        summary: 'Deterministic planning smoke draft',
      }).generate(context);
    },
  };
  app = await buildApp({
    scheduleDraftDependencies: { contextBuilder, generator },
  });
  const [owner, other] = users;
  const ownerToken = app.jwt.sign({
    jti: runId,
    sid: runId,
    sub: owner._id.toString(),
    type: 'access',
  });
  const otherToken = app.jwt.sign({
    jti: `${runId}-other`,
    sid: `${runId}-other`,
    sub: other._id.toString(),
    type: 'access',
  });
  const unauthorized = await app.inject({ method: 'GET', url: '/goals' });
  assert.equal(unauthorized.statusCode, 401);
  const goalResponse = await app.inject({
    body: { horizon: 'weekly', importance: 5, title: 'Ship smoke test' },
    headers: authHeaders(ownerToken),
    method: 'POST',
    url: '/goals',
  });
  assert.equal(goalResponse.statusCode, 201);
  const goal = json(goalResponse);
  const taskResponse = await app.inject({
    body: {
      energyLevel: 'high',
      estimatedMinutes: 60,
      goalId: goal._id,
      goalImpact: 5,
      importance: 5,
      title: 'Verify planning flow',
    },
    headers: authHeaders(ownerToken),
    method: 'POST',
    url: '/tasks',
  });
  assert.equal(taskResponse.statusCode, 201);
  const draftRequest = {
    body: { date },
    headers: { ...authHeaders(ownerToken), 'idempotency-key': runId },
    method: 'POST',
    url: '/schedule-drafts',
  };
  const created = await app.inject(draftRequest);
  assert.equal(created.statusCode, 201);
  assert.equal(json(created).replayed, false);
  const replayed = await app.inject(draftRequest);
  assert.equal(replayed.statusCode, 200);
  assert.equal(json(replayed).replayed, true);
  const draft = json(created).draft;
  const retrieved = await app.inject({
    headers: authHeaders(ownerToken),
    method: 'GET',
    url: `/schedule-drafts?date=${date}`,
  });
  assert.equal(retrieved.statusCode, 200);
  assert.equal(json(retrieved)._id, draft._id);
  const isolated = await app.inject({
    headers: authHeaders(otherToken),
    method: 'GET',
    url: `/schedule-drafts?date=${date}`,
  });
  assert.equal(isolated.statusCode, 404);
  const rejected = await app.inject({
    headers: authHeaders(ownerToken),
    method: 'POST',
    url: `/schedule-drafts/${draft._id}/reject`,
  });
  assert.equal(rejected.statusCode, 200);
  assert.equal(json(rejected).draft.status, 'rejected');
  const log = await AiRequestLogModel.findOne({ userId: owner._id }).lean();
  assert.equal(log?.responseStatus, 'success');
  assert.equal(typeof log?.payloadHash, 'string');
  console.log('authenticated planning flow validation passed');
} finally {
  if (app) await app.close().catch(() => undefined);
  await Promise.all([
    AiRequestLogModel.deleteMany({ userId: { $in: userIds } }),
    GoalModel.deleteMany({ userId: { $in: userIds } }),
    ScheduleDraftModel.deleteMany({ userId: { $in: userIds } }),
    TaskModel.deleteMany({ userId: { $in: userIds } }),
    UserModel.deleteMany({ _id: { $in: userIds } }),
  ]).catch(() => undefined);
  await disconnectMongo().catch(() => undefined);
}
