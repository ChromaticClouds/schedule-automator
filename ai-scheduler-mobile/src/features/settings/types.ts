export type SchedulePreferences = {
  maxDailyWorkMinutes: number;
  timezone: string;
  wakeOffsetMinutes: number;
  wakeTime: string;
};

export type SchedulePreferencesForm = {
  maxDailyWorkMinutes: string;
  timezone: string;
  wakeOffsetMinutes: string;
  wakeTime: string;
};
