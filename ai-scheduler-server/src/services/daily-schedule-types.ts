export type KeyValueStore = {
  del(key: string): Promise<unknown>;
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

export type DailyScheduleDocument = {
  checklist: Array<{ done: boolean; title: string }>;
  deadline: Date;
  description: string;
  energyLevel: 'medium';
  estimatedMinutes: number;
  generationIndex: 0;
  generationKeyHash: string;
  goalImpact: 3;
  importance: 3;
  status: 'scheduled';
  title: string;
  userId: string;
};

export type DailyScheduleStore = {
  createDailySchedule(document: DailyScheduleDocument): Promise<void>;
  hasDailySchedule(userId: string, generationKeyHash: string): Promise<boolean>;
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
