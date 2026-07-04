import { strict as assert } from 'node:assert';

Object.assign(process.env, {
  AI_PAYLOAD_LOGGING: 'off',
  APP_ORIGIN: 'http://localhost:8081',
  APP_TIMEZONE: 'Asia/Seoul',
  AUTH_REFRESH_TTL_SECONDS: '2592000',
  CORS_ORIGIN: 'http://localhost:8081',
  ENCRYPTION_KEY: 'x'.repeat(32),
  GEMINI_API_KEY: 'gemini-test-key',
  GOOGLE_CALENDAR_SCOPES: 'openid email',
  GOOGLE_CLIENT_ID: 'google-client-id',
  GOOGLE_CLIENT_SECRET: 'google-client-secret',
  GOOGLE_REDIRECT_URI: 'http://localhost:3000/auth/google/callback',
  JWT_SECRET: 'x'.repeat(32),
  MONGO_URL: 'mongodb://localhost:27017/test',
  QUEUE_NAME: 'test-queue',
  REDIS_KEY_PREFIX: 'test:',
  REDIS_URL: 'redis://localhost:6379',
  REFRESH_TOKEN_PEPPER: 'x'.repeat(32),
  SERVER_BASE_URL: 'http://localhost:3000',
  SESSION_SECRET: 'x'.repeat(32),
});

const { runDailyScheduleTick } = await import(
  '../dist/services/daily-schedule-service.js'
);

class FakeRedis {
  data = new Map();

  async del(key) {
    return this.data.delete(key) ? 1 : 0;
  }

  async get(key) {
    return this.data.get(key) ?? null;
  }

  async set(key, value, ...args) {
    if (args.includes('NX') && this.data.has(key)) return null;
    this.data.set(key, value);
    return 'OK';
  }
}

const user = {
  _id: 'user-1',
  maxDailyWorkMinutes: 180,
  timezone: 'UTC',
  wakeOffsetMinutes: 10,
  wakeTime: '07:00',
};

let createdDocument = null;
const redis = new FakeRedis();
const store = {
  async createDailySchedule(document) {
    createdDocument = document;
  },
  async hasDailySchedule() {
    return false;
  },
  async hasGoogleConnection() {
    return true;
  },
  async listCandidateTasks() {
    return [
      { estimatedMinutes: 90, title: 'Draft implementation' },
      { estimatedMinutes: 120, title: 'Review validation' },
    ];
  },
  async listUsers() {
    return [user];
  },
};

const now = new Date('2026-07-04T07:10:00.000Z');
const first = await runDailyScheduleTick(redis, now, store);

assert.equal(first.scannedUsers, 1);
assert.equal(first.dueUsers, 1);
assert.equal(first.createdSchedules, 1);
assert.equal(first.failedUsers, 0);
assert.equal(createdDocument.title, 'Daily schedule for 2026-07-04');
assert.equal(createdDocument.estimatedMinutes, 180);
assert.equal(createdDocument.checklist.length, 2);
assert.equal(
  await redis.get('test:scheduler:daily:user-1:2026-07-04:done'),
  '1',
);
assert.equal(
  await redis.get('test:scheduler:daily:user-1:2026-07-04:lock'),
  null,
);

createdDocument = null;
const second = await runDailyScheduleTick(redis, now, store);

assert.equal(second.createdSchedules, 0);
assert.equal(second.skippedUsers, 1);
assert.equal(createdDocument, null);

const failingRedis = new FakeRedis();
const failingStore = {
  ...store,
  async createDailySchedule() {
    throw new Error('database unavailable');
  },
};
const failed = await runDailyScheduleTick(failingRedis, now, failingStore);

assert.equal(failed.failedUsers, 1);
assert.ok(
  await failingRedis.get('test:scheduler:daily:user-1:2026-07-04:retry'),
);

console.log('daily schedule worker validation passed');
