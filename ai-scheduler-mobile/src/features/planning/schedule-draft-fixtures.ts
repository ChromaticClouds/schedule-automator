import type { ScheduleDraft } from './types';

const baseDate = '2026-07-04';
const baseDraft = {
  _id: 'draft-1',
  assumptions: ['Focused work should happen before lunch.'],
  blocks: [
    {
      _id: 'block-1',
      end: '2026-07-04T01:30:00.000Z',
      reason: 'Highest impact task with enough open time.',
      source: 'ai',
      start: '2026-07-04T00:30:00.000Z',
      status: 'draft',
      taskId: 'task-1',
      title: 'Implement schedule draft UI',
      type: 'task',
    },
    {
      _id: 'block-2',
      end: '2026-07-04T02:00:00.000Z',
      reason: 'Short break after a focused block.',
      source: 'ai',
      start: '2026-07-04T01:45:00.000Z',
      status: 'draft',
      title: 'Recovery break',
      type: 'break',
    },
  ],
  date: baseDate,
  generatedAt: '2026-07-04T00:00:00.000Z',
  summary: 'One focused task block with a recovery break.',
  updatedAt: '2026-07-04T00:00:00.000Z',
  userId: 'user-1',
  warnings: [],
} satisfies Omit<ScheduleDraft, 'status'>;

const withStatus = (status: ScheduleDraft['status']): ScheduleDraft => ({
  ...baseDraft,
  blocks: baseDraft.blocks.map((block) => ({
    ...block,
    calendarEventId: ['approved', 'synced'].includes(status)
      ? `event-${block._id}`
      : undefined,
    status: status === 'synced' ? 'synced' : block.status,
  })),
  status,
  ...(status === 'approved' || status === 'synced'
    ? { approvedAt: '2026-07-04T00:10:00.000Z' }
    : {}),
  ...(status === 'synced' ? { syncedAt: '2026-07-04T00:11:00.000Z' } : {}),
});

export const scheduleDraftFixtures = {
  date: baseDate,
  draft: withStatus('draft'),
  empty: undefined,
  expired: withStatus('expired'),
  rejected: withStatus('rejected'),
  requestInProgressError: 'Draft generation is already running.',
  staleContextError: 'Calendar changed. Generate a fresh draft.',
  synced: withStatus('synced'),
};
