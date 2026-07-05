import { defineConfig, devices } from '@playwright/test';

const platform = process.platform;

export default defineConfig({
  testDir: './tests/visual',
  outputDir: './test-results/visual',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  snapshotPathTemplate:
    '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  use: {
    baseURL: 'http://127.0.0.1:7007',
    colorScheme: 'light',
    locale: 'en-US',
    timezoneId: 'Asia/Seoul',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: `chromium-${platform}`,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: 'pnpm storybook:web',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    url: 'http://127.0.0.1:7007',
  },
});
