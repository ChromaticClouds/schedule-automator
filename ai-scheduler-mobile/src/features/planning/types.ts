export type Goal = {
  _id: string;
  title: string;
  importance: 1 | 2 | 3 | 4 | 5;
  status: 'active' | 'paused' | 'completed' | 'archived';
};

export type Task = {
  _id: string;
  title: string;
  estimatedMinutes: number;
  status: 'todo' | 'scheduled' | 'done' | 'missed' | 'overflow' | 'archived';
  postponedCount: number;
};

export type GoalBreakdownResult = {
  replayed: boolean;
  tasks: Task[];
};

export type TaskSummaryStatus = Task['status'];

export type TaskSummaryBucket = {
  count: number;
  estimatedMinutes: number;
};

export type TaskSummary = {
  byStatus: Record<string, TaskSummaryBucket>;
  range: { from?: string; to?: string };
  statuses: TaskSummaryStatus[];
  tasks: {
    _id: string;
    deadline?: string;
    estimatedMinutes: number;
    status: TaskSummaryStatus;
    title: string;
  }[];
  totals: TaskSummaryBucket;
};

export type ProtectedTime = {
  _id: string;
  title: string;
  category: 'sleep' | 'meal' | 'shower' | 'leisure' | 'exercise' | 'custom';
  startTime: string;
  endTime: string;
  protectionLevel: 'hard' | 'soft';
};

export type ScheduleDraftStatus =
  | 'draft'
  | 'approved'
  | 'synced'
  | 'rejected'
  | 'expired';

export type ScheduleBlock = {
  _id: string;
  taskId?: string;
  title: string;
  start: string;
  end: string;
  type: 'task' | 'routine' | 'break' | 'protected' | 'calendar_event';
  source: 'ai' | 'user' | 'calendar' | 'system';
  status: 'draft' | 'approved' | 'synced' | 'done' | 'missed';
  calendarEventId?: string;
  reason?: string;
};

export type ScheduleBlockEditInput = {
  endTime: string;
  expectedUpdatedAt: string;
  startTime: string;
  title: string;
};

export type ScheduleDraft = {
  _id: string;
  userId: string;
  date: string;
  status: ScheduleDraftStatus;
  generatedAt: string;
  approvedAt?: string;
  syncedAt?: string;
  summary?: string;
  updatedAt: string;
  assumptions: string[];
  warnings: string[];
  blocks: ScheduleBlock[];
};

export type ScheduleDraftResult = {
  draft: ScheduleDraft;
  replayed: boolean;
};

export type DailyReview = {
  _id: string;
  date: string;
  completedTaskIds: string[];
  missedTaskIds: string[];
  notes?: string;
};

export type DailyReviewResult = {
  review: DailyReview | null;
  tasks: Task[];
};

export type SaveDailyReviewInput = {
  completedTaskIds: string[];
  missedTaskIds: string[];
  notes?: string;
};

export type WeeklyRescheduleResult = {
  drafts: ScheduleDraft[];
  overflowTaskIds: string[];
  placedTaskIds: string[];
  replayed: boolean;
};

export type WeeklyRescheduleInput = {
  idempotencyKey: string;
  reviewDate: string;
};

export type CreateGoalInput = {
  title: string;
  importance: 1 | 2 | 3 | 4 | 5;
};

export type CreateTaskInput = {
  title: string;
  estimatedMinutes: number;
  importance: 1 | 2 | 3 | 4 | 5;
  goalImpact: 1 | 2 | 3 | 4 | 5;
  energyLevel: 'low' | 'medium' | 'high';
};

export type CreateProtectedTimeInput = {
  title: string;
  category: 'sleep' | 'meal' | 'shower' | 'leisure' | 'exercise' | 'custom';
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  protectionLevel: 'hard' | 'soft';
};
