Object.assign(process.env, {
  AI_PAYLOAD_LOGGING: 'off',
  APP_ORIGIN: 'http://localhost:8081',
  APP_TIMEZONE: 'Asia/Seoul',
  AUTH_REFRESH_TTL_SECONDS: '2592000',
  CORS_ORIGIN: 'http://localhost:8081',
  DAILY_PLAN_JOB_ENABLED: 'false',
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

export class FakeRedis {
  data = new Map();

  async del(key) {
    return this.data.delete(key) ? 1 : 0;
  }

  async eval(_script, _numberOfKeys, key, token) {
    if (this.data.get(key) !== token) return 0;
    return this.del(key);
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

export const user = {
  _id: 'user-1',
  maxDailyWorkMinutes: 180,
  timezone: 'UTC',
  wakeOffsetMinutes: 10,
  wakeTime: '07:00',
};

export const createHarness = () => {
  let generatedDraft = null;
  const store = {
    async createDailySchedule(userId, date, idempotencyKey) {
      generatedDraft = { date, idempotencyKey, userId };
      return { replayed: false };
    },
    async hasGoogleConnection() {
      return true;
    },
    async listCandidateTasks() {
      return [{ estimatedMinutes: 90, title: 'Draft implementation' }];
    },
    async listUsers() {
      return [user];
    },
  };
  return {
    getGeneratedDraft: () => generatedDraft,
    resetGeneratedDraft: () => {
      generatedDraft = null;
    },
    store,
  };
};
