export const planningKeys = {
  dailyReview: (date: string) => ['planning', 'daily-review', date] as const,
  goals: ['planning', 'goals'] as const,
  protectedTimes: ['planning', 'protected-times'] as const,
  scheduleDraft: (date: string) => ['planning', 'schedule-draft', date] as const,
  scheduleDrafts: ['planning', 'schedule-draft'] as const,
  taskSummary: ['planning', 'task-summary'] as const,
  tasks: ['planning', 'tasks'] as const,
};
