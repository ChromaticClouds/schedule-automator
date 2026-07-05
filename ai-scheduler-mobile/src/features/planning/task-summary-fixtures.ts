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
      title: '상태 미리보기 픽스처 구현',
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
    errorMessage: '작업 요약을 불러오지 못했습니다. 작업을 새로고침한 뒤 다시 시도하세요.',
    isLoading: false,
  } satisfies Fixture,
  loading: { isLoading: true } satisfies Fixture,
  populated: { isLoading: false, summary: populatedSummary } satisfies Fixture,
};
