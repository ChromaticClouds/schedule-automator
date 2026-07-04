export type KeyValueStore = {
  del(key: string): Promise<unknown>;
  eval(
    script: string,
    numberOfKeys: number,
    ...args: string[]
  ): Promise<unknown>;
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    ...args: Array<number | string>
  ): Promise<unknown>;
};

export type SchedulerUser = {
  _id: string;
  maxDailyWorkMinutes: number;
  timezone: string;
  wakeOffsetMinutes: number;
  wakeTime: string;
};

export type CandidateTask = {
  estimatedMinutes: number;
  title: string;
};

export type DailyScheduleStore = {
  createDailySchedule(
    userId: string,
    date: string,
    idempotencyKey: string,
  ): Promise<{ replayed: boolean }>;
  hasGoogleConnection(userId: string): Promise<boolean>;
  listCandidateTasks(userId: string): Promise<CandidateTask[]>;
  listUsers(): Promise<SchedulerUser[]>;
};

export type DailyScheduleStats = {
  createdSchedules: number;
  dueUsers: number;
  failedUsers: number;
  scannedUsers: number;
  skippedUsers: number;
};
