import { setTimeout as delay } from 'node:timers/promises';
import { buildApp } from '@/app.js';
import { ENV } from '@/config/env.js';
import { connectMongo, disconnectMongo } from '@/db/connection.js';
import { runDailyScheduleLoop } from '@/services/daily-schedule-loop.js';
import type { KeyValueStore } from '@/services/daily-schedule-types.js';

let shouldStop = false;
const shutdown = new AbortController();

const stop = () => {
  shouldStop = true;
  shutdown.abort();
};

process.once('SIGINT', stop);
process.once('SIGTERM', stop);

const runWorker = async () => {
  if (!ENV.DAILY_PLAN_JOB_ENABLED) {
    console.info('daily schedule worker disabled');
    return;
  }

  let app: Awaited<ReturnType<typeof buildApp>> | undefined;

  try {
    await connectMongo();
    app = await buildApp();
    app.log.info('daily schedule worker started');
    const redis = app.redis as unknown as KeyValueStore;
    await runDailyScheduleLoop(redis, {
      logError: (error) =>
        app?.log.error({ error }, 'daily schedule worker tick failed'),
      logStats: (stats) =>
        app?.log.info({ stats }, 'daily schedule worker tick finished'),
      shouldStop: () => shouldStop,
      wait: () =>
        delay(
          ENV.DAILY_SCHEDULE_POLL_INTERVAL_MS,
          undefined,
          { signal: shutdown.signal },
        ).catch((error: unknown) => {
          if ((error as { name?: string }).name !== 'AbortError') throw error;
        }),
    });
  } finally {
    await app?.close();
    await disconnectMongo();
  }
};

void runWorker().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
