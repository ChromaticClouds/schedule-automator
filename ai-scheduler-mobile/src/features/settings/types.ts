export type SchedulePreferences = {
  maxDailyWorkMinutes: number;
  timezone: string;
  wakeTime: string;
};

export type SchedulePreferencesForm = {
  maxDailyWorkMinutes: string;
  timezone: string;
  wakeTime: string;
};
