import type { DailyReviewViewProps } from './daily-review-view';

type Fixture = Omit<DailyReviewViewProps, 'onNotesChange' | 'onSave' | 'onSelect'>;

const date = '2026-07-04';
const tasks = [
  {
    _id: 'task-review-1',
    estimatedMinutes: 45,
    postponedCount: 0,
    status: 'scheduled',
    title: 'Review schedule draft output',
  },
  {
    _id: 'task-review-2',
    estimatedMinutes: 30,
    postponedCount: 1,
    status: 'missed',
    title: 'Refine missed-task plan',
  },
] satisfies Fixture['tasks'];

const base = {
  date,
  isLoading: false,
  notes: '',
  saveIsPending: false,
  saveIsSuccess: false,
  states: {},
} satisfies Omit<Fixture, 'tasks'>;

export const dailyReviewFixtures = {
  empty: { ...base, tasks: [] } satisfies Fixture,
  loading: { ...base, isLoading: true, tasks: undefined } satisfies Fixture,
  saveError: {
    ...base,
    saveErrorMessage: 'Review could not be saved. Try again before running a weekly replan.',
    tasks,
  } satisfies Fixture,
  saved: { ...base, saveIsSuccess: true, tasks } satisfies Fixture,
  tasks: {
    ...base,
    notes: 'Shift unfinished work into next week.',
    states: { 'task-review-1': 'completed', 'task-review-2': 'missed' },
    tasks,
  } satisfies Fixture,
};
