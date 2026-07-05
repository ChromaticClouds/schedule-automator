import type { ScheduleDraft } from './types';
import type { ScheduleDraftPanelViewProps } from './schedule-draft-panel-view';

const baseDate = '2026-07-04';
const baseDraft = {
  _id: 'draft-1',
  assumptions: ['Focused work should happen before lunch.'],
  blocks: [
    {
      _id: 'block-1',
      end: '2026-07-04T01:30:00.000Z',
      reason: '비어 있는 시간에 넣을 수 있는 가장 중요한 작업입니다.',
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
    calendarEventId: status === 'synced'
      ? `event-${block._id}`
      : undefined,
    status: status === 'synced'
      ? 'synced'
      : status === 'approved'
        ? 'approved'
        : block.status,
  })),
  status,
  ...(status === 'approved' || status === 'synced'
    ? { approvedAt: '2026-07-04T00:10:00.000Z' }
    : {}),
  ...(status === 'synced' ? { syncedAt: '2026-07-04T00:11:00.000Z' } : {}),
});

export const scheduleDraftFixtures = {
  date: baseDate,
  approved: withStatus('approved'),
  draft: withStatus('draft'),
  empty: undefined,
  expired: withStatus('expired'),
  rejected: withStatus('rejected'),
  requestInProgressError: 'Draft generation is already running.',
  staleContextError: 'Calendar changed. Generate a fresh draft.',
  synced: withStatus('synced'),
};

const noop = () => undefined;

const baseView = {
  busy: false,
  date: baseDate,
  errorMessage: undefined,
  isLoading: false,
  noDraft: false,
  onApprove: noop,
  onEdit: noop,
  onGenerate: noop,
  onReconnect: noop,
  onRegenerate: noop,
  onReject: noop,
  timezone: 'Asia/Seoul',
} satisfies Omit<ScheduleDraftPanelViewProps, 'draft'>;

const withDraft = (
  draft: ScheduleDraft | undefined,
  props: Partial<ScheduleDraftPanelViewProps> = {},
): ScheduleDraftPanelViewProps => ({
  ...baseView,
  draft,
  ...props,
});

export const scheduleDraftPanelFixtures = {
  approved: withDraft(scheduleDraftFixtures.approved),
  blockNotEditableError: withDraft(scheduleDraftFixtures.draft, {
    errorMessage: 'This block cannot be edited.',
  }),
  draft: withDraft(scheduleDraftFixtures.draft),
  editValidationError: withDraft(scheduleDraftFixtures.draft, {
    errorMessage: '현재 일정과 충돌하는 수정입니다.',
  }),
  empty: withDraft(undefined, { noDraft: true }),
  expired: withDraft(scheduleDraftFixtures.expired),
  loading: withDraft(undefined, { isLoading: true }),
  pending: withDraft(scheduleDraftFixtures.draft, { busy: true }),
  rejected: withDraft(scheduleDraftFixtures.rejected),
  requestInProgressError: withDraft(undefined, {
    errorMessage: scheduleDraftFixtures.requestInProgressError,
    noDraft: true,
  }),
  regenerateInvalidStateError: withDraft(scheduleDraftFixtures.synced, {
    errorMessage: '초안 상태가 변경되었습니다. 새로고침 후 다시 시도하세요.',
  }),
  googleReconnectError: withDraft(scheduleDraftFixtures.draft, {
    errorCode: 'GOOGLE_RECONNECT_REQUIRED',
    errorMessage: 'Google Calendar 연결이 만료되었습니다. 다시 연결하세요.',
  }),
  googleSyncError: withDraft(scheduleDraftFixtures.approved, {
    errorCode: 'GOOGLE_CALENDAR_SYNC_FAILED',
    errorMessage: 'Google Calendar 동기화에 실패했습니다. 나중에 다시 시도하세요.',
  }),
  staleContextError: withDraft(scheduleDraftFixtures.draft, {
    errorCode: 'STALE_DRAFT_CONTEXT',
    errorMessage: scheduleDraftFixtures.staleContextError,
  }),
  staleVersionError: withDraft(scheduleDraftFixtures.draft, {
    errorMessage: 'Draft changed elsewhere. Review the latest version.',
  }),
  synced: withDraft(scheduleDraftFixtures.synced),
};
