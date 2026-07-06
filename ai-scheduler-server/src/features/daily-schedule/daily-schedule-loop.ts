import { runDailyScheduleTick } from './daily-schedule-service.js';
import type {
  DailyScheduleStats,
  KeyValueStore,
} from './daily-schedule-types.js';

type DailyScheduleLoopOptions = {
  logError: (error: unknown) => void;
  logStats: (stats: DailyScheduleStats) => void;
  shouldStop: () => boolean;
  wait: () => Promise<void>;
  tick?: (redis: KeyValueStore) => Promise<DailyScheduleStats>;
};

export const runDailyScheduleLoop = async (
  redis: KeyValueStore,
  options: DailyScheduleLoopOptions,
) => {
  const tick = options.tick ?? runDailyScheduleTick;
  while (!options.shouldStop()) {
    try {
      options.logStats(await tick(redis));
    } catch (error) {
      options.logError(error);
    }
    await options.wait();
  }
};
