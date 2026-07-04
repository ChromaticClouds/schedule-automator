import { setTimeout as delay } from 'node:timers/promises';
import { buildApp } from '@/app.js';
import { ENV } from '@/config/env.js';
import { connectMongo, disconnectMongo } from '@/db/connection.js';
import { runDailyScheduleTick } from '@/services/daily-schedule-service.js';
import type { KeyValueStore } from '@/services/daily-schedule-types.js';

let shouldStop = false;

const stop = () => {
  shouldStop = true;
};

process.once('SIGINT', stop);
process.once('SIGTERM', stop);

const runWorker = async () => {
  await connectMongo();
  const app = await buildApp();

  try {
    app.log.info('daily schedule worker started');
    const redis = app.redis as unknown as KeyValueStore;
    while (!shouldStop) {
      const stats = await runDailyScheduleTick(redis);
      app.log.info({ stats }, 'daily schedule worker tick finished');
      await delay(ENV.DAILY_SCHEDULE_POLL_INTERVAL_MS);
    }
  } finally {
    await app.close();
    await disconnectMongo();
  }
};

void runWorker().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
