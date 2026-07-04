import { strict as assert } from 'node:assert';
import {
  schedulePreferencesSchema,
  updateSchedulePreferencesSchema,
} from '../dist/schemas/schedule-preferences.js';

const preferences = {
  maxDailyWorkMinutes: 480,
  timezone: 'Asia/Seoul',
  wakeOffsetMinutes: 10,
  wakeTime: '07:00',
};

assert.deepEqual(schedulePreferencesSchema.parse(preferences), preferences);
assert.equal(
  updateSchedulePreferencesSchema.safeParse({ wakeTime: '23:59' }).success,
  true,
);
assert.equal(
  updateSchedulePreferencesSchema.safeParse({ wakeTime: '24:00' }).success,
  false,
);
assert.equal(
  updateSchedulePreferencesSchema.safeParse({ timezone: 'Mars/Olympus' }).success,
  false,
);
assert.equal(
  updateSchedulePreferencesSchema.safeParse({ maxDailyWorkMinutes: 59 }).success,
  false,
);
assert.equal(
  updateSchedulePreferencesSchema.safeParse({ maxDailyWorkMinutes: 721 }).success,
  false,
);
assert.equal(
  updateSchedulePreferencesSchema.safeParse({ wakeOffsetMinutes: 240 }).success,
  true,
);
assert.equal(
  updateSchedulePreferencesSchema.safeParse({ wakeOffsetMinutes: 241 }).success,
  false,
);
assert.equal(updateSchedulePreferencesSchema.safeParse({}).success, false);

console.log('schedule preferences validation passed');
