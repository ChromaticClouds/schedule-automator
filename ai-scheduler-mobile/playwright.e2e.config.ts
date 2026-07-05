import { defineConfig, devices } from '@playwright/test';

const serverEnv = {
  ...process.env,
  NODE_ENV: 'test',
  PORT: '3100',
  SERVER_BASE_URL: 'http://127.0.0.1:3100',
  APP_ORIGIN: 'http://127.0.0.1:8081',
  CORS_ORIGIN: 'http://127.0.0.1:8081',
  MONGO_URL:
    'mongodb://127.0.0.1:27017/schedule_automator_e2e?replicaSet=rs0&directConnection=true',
  REDIS_URL: 'redis://127.0.0.1:6379',
  JWT_SECRET: 'e2e-jwt-secret-at-least-32-characters',
  SESSION_SECRET: 'e2e-session-secret-at-least-32-characters',
  ENCRYPTION_KEY: '00000000000000000000000000000000',
  REFRESH_TOKEN_PEPPER: 'e2e-refresh-pepper-at-least-32-characters',
  GEMINI_API_KEY: 'e2e-gemini-key',
  GOOGLE_CLIENT_ID: 'e2e-google-client-id',
  GOOGLE_CLIENT_SECRET: 'e2e-google-client-secret',
  GOOGLE_REDIRECT_URI: 'http://127.0.0.1:3100/auth/google/callback',
  GOOGLE_CALENDAR_SCOPES: 'openid email calendar',
  QUEUE_NAME: 'planning-e2e',
  DAILY_PLAN_JOB_ENABLED: 'false',
};

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results/e2e',
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:8081',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command:
        'pnpm --dir ../ai-scheduler-server build && pnpm --dir ../ai-scheduler-server e2e:start',
      env: serverEnv,
      timeout: 180_000,
      url: 'http://127.0.0.1:3100/health',
    },
    {
      command: 'pnpm e2e:web',
      timeout: 180_000,
      url: 'http://127.0.0.1:8081',
    },
  ],
});
