import type { WeeklyRescheduleResult } from './types';
import type { WeeklyRescheduleViewProps } from './weekly-reschedule-view';
import { hasUnprocessedMissedTasks } from './weekly-reschedule-state';

type Fixture = Omit<WeeklyRescheduleViewProps, 'onRun'>;

const placedResult: WeeklyRescheduleResult = {
  drafts: [{
    _id: 'draft-saturday',
    assumptions: [],
    blocks: [{
      _id: 'block-portfolio',
      end: '2026-07-04T11:00:00+09:00',
      reason: '가장 영향도가 큰 미완료 작업',
      source: 'ai',
      start: '2026-07-04T10:00:00+09:00',
      status: 'draft',
      taskId: 'task-portfolio',
      title: '포트폴리오 README 마무리',
      type: 'task',
    }],
    date: '2026-07-04',
    generatedAt: '2026-07-03T22:00:00+09:00',
    status: 'draft',
    summary: '미룬 작업 1개를 토요일로 옮겼습니다.',
    updatedAt: '2026-07-03T22:00:00+09:00',
    userId: 'user-1',
    warnings: [],
  }],
  overflowTaskIds: [],
  placedTaskIds: ['task-portfolio'],
  replayed: false,
};

export const weeklyRescheduleFixtures = {
  empty: {
    disabled: true,
    isPending: false,
    taskNames: {},
  } satisfies Fixture,
  error: {
    disabled: false,
    errorMessage: 'The generated plan was not safe to use.',
    isPending: false,
    taskNames: { 'task-portfolio': '포트폴리오 README 마무리' },
  } satisfies Fixture,
  overflow: {
    disabled: true,
    isPending: false,
    result: {
      ...placedResult,
      drafts: [],
      overflowTaskIds: ['task-inventory'],
      placedTaskIds: [],
    },
    taskNames: { 'task-inventory': '재고 서비스 리팩터링' },
  } satisfies Fixture,
  pending: {
    disabled: false,
    isPending: true,
    taskNames: {},
  } satisfies Fixture,
  placed: {
    disabled: true,
    isPending: false,
    result: placedResult,
    taskNames: { 'task-portfolio': '포트폴리오 README 마무리' },
  } satisfies Fixture,
  replayed: {
    disabled: true,
    isPending: false,
    result: {
      drafts: [],
      overflowTaskIds: [],
      placedTaskIds: [],
      replayed: true,
    },
    taskNames: {},
  } satisfies Fixture,
  schemaError: {
    disabled: false,
    errorMessage: '생성된 계획 형식이 올바르지 않습니다.',
    isPending: false,
    taskNames: {},
  } satisfies Fixture,
  saveError: {
    disabled: false,
    errorMessage: '생성된 계획을 저장하지 못했습니다. 다시 시도하세요.',
    isPending: false,
    taskNames: {},
  } satisfies Fixture,
};

export const weeklyRescheduleRerunFixtures = {
  newMissedTask: hasUnprocessedMissedTasks(
    ['task-portfolio', 'task-new'],
    ['task-portfolio'],
  ),
  unchanged: hasUnprocessedMissedTasks(
    ['task-portfolio'],
    ['task-portfolio', 'task-overflow'],
  ),
};
