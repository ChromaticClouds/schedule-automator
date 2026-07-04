import type { TaskSummaryViewProps } from './task-summary-view';

type Fixture = TaskSummaryViewProps;

const populatedSummary = {
  byStatus: {
    done: { count: 1, estimatedMinutes: 45 },
    missed: { count: 1, estimatedMinutes: 30 },
    scheduled: { count: 1, estimatedMinutes: 60 },
  },
  range: { from: '2026-07-04', to: '2026-07-10' },
  statuses: ['scheduled', 'done', 'missed'],
  tasks: [
    {
      _id: 'task-summary-1',
      estimatedMinutes: 60,
      status: 'scheduled',
      title: 'Implement state preview fixtures',
    },
  ],
  totals: { count: 3, estimatedMinutes: 135 },
} satisfies NonNullable<Fixture['summary']>;

export const taskSummaryFixtures = {
  empty: {
    isLoading: false,
    summary: {
      byStatus: {},
      range: {},
      statuses: ['todo', 'scheduled', 'done', 'missed', 'overflow'],
      tasks: [],
      totals: { count: 0, estimatedMinutes: 0 },
    },
  } satisfies Fixture,
  error: {
    errorMessage: 'Task summary could not be loaded. Try again after refreshing tasks.',
    isLoading: false,
  } satisfies Fixture,
  loading: { isLoading: true } satisfies Fixture,
  populated: { isLoading: false, summary: populatedSummary } satisfies Fixture,
};
