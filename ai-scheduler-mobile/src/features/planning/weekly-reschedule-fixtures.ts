import type { WeeklyRescheduleResult } from './types';
import type { WeeklyRescheduleViewProps } from './weekly-reschedule-view';

type Fixture = Omit<WeeklyRescheduleViewProps, 'onRun'>;

const placedResult: WeeklyRescheduleResult = {
  drafts: [{
    _id: 'draft-saturday',
    assumptions: [],
    blocks: [{
      _id: 'block-portfolio',
      end: '2026-07-04T11:00:00+09:00',
      reason: 'Highest impact missed task',
      source: 'ai',
      start: '2026-07-04T10:00:00+09:00',
      status: 'draft',
      taskId: 'task-portfolio',
      title: 'Finish portfolio README',
      type: 'task',
    }],
    date: '2026-07-04',
    generatedAt: '2026-07-03T22:00:00+09:00',
    status: 'draft',
    summary: 'One missed task moved to Saturday.',
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
    taskNames: { 'task-portfolio': 'Finish portfolio README' },
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
    taskNames: { 'task-inventory': 'Refactor inventory service' },
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
    taskNames: { 'task-portfolio': 'Finish portfolio README' },
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
};
