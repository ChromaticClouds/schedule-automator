import { Types } from 'mongoose';
import {
  ScheduleDraftModel,
  TaskModel,
} from '@/models/index.js';
import { ensureAiCalendar } from './ai-calendar.js';
import { buildScheduleContext } from './schedule-context.js';
import { validateScheduleDraft } from './schedule-validation.js';
import {
  createGoogleCalendarClient,
  GoogleConnectionError,
} from './google-client.js';
import {
  createGoogleCalendarEventWriter,
  type CalendarEventWriter,
} from './calendar-writer.js';

export class ScheduleApprovalError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'ScheduleApprovalError';
  }
}

const fail = (message: string, statusCode: number, code: string) => {
  throw new ScheduleApprovalError(message, statusCode, code);
};

const syncBlocks = async (
  draft: Awaited<ReturnType<typeof ScheduleDraftModel.findOne>>,
  calendarId: string,
  writer: CalendarEventWriter,
) => {
  let wrote = false;
  for (const block of draft?.blocks ?? []) {
    if (block.source !== 'ai' || block.calendarEventId) continue;
    if (!['task', 'break'].includes(block.type)) continue;
    const { eventId } = await writer.createEvent(calendarId, {
      end: block.end,
      start: block.start,
      title: block.title,
    });
    block.calendarEventId = eventId;
    block.status = 'synced';
    wrote = true;
    await draft?.save();
  }
  return wrote;
};

const validateCurrentContext = async (
  draft: NonNullable<Awaited<ReturnType<typeof ScheduleDraftModel.findOne>>>,
) => {
  const context = await buildScheduleContext(draft.userId, draft.date);
  const output = {
    assumptions: draft.assumptions,
    blocks: draft.blocks
      .filter((block) => block.source === 'ai')
      .filter((block) => ['task', 'break'].includes(block.type))
      .map((block) => ({
        end: block.end.toISOString(),
        ...(block.reason ? { reason: block.reason } : {}),
        start: block.start.toISOString(),
        ...(block.taskId ? { taskId: block.taskId.toString() } : {}),
        title: block.title,
        type: block.type as 'task' | 'break',
      })),
    summary: draft.summary ?? 'Approved schedule draft',
    warnings: draft.warnings,
  };

  const valid = validateScheduleDraft(output, context);
  if (!valid.ok) {
    draft.status = 'expired';
    await draft.save();
    return fail(valid.reason, 409, 'STALE_DRAFT_CONTEXT');
  }
};

const markTasksScheduled = async (
  draft: NonNullable<Awaited<ReturnType<typeof ScheduleDraftModel.findOne>>>,
) => {
  const taskIds = draft.blocks
    .filter((block) => block.type === 'task' && block.calendarEventId)
    .map((block) => block.taskId)
    .filter((taskId): taskId is Types.ObjectId => taskId instanceof Types.ObjectId);

  if (taskIds.length === 0) return;
  await TaskModel.updateMany(
    { _id: { $in: taskIds }, userId: draft.userId },
    { $set: { status: 'scheduled' } },
  );
};

const mapCalendarSyncError = (error: unknown): never => {
  if (error instanceof GoogleConnectionError) throw error;
  return fail('Google Calendar sync failed', 502, 'GOOGLE_CALENDAR_SYNC_FAILED');
};

export const approveScheduleDraft = async (
  userId: Types.ObjectId,
  draftId: Types.ObjectId,
  writer?: CalendarEventWriter,
) => {
  const now = new Date();
  const draft = await ScheduleDraftModel.findOneAndUpdate(
    { _id: draftId, status: 'draft', userId },
    {
      $set: {
        approvedAt: now,
        status: 'approved',
        'blocks.$[block].status': 'approved',
      },
    },
    {
      arrayFilters: [{ 'block.status': 'draft' }],
      new: true,
    },
  );
  if (!draft) {
    const current = await ScheduleDraftModel.findOne({ _id: draftId, userId });
    if (!current) return fail('Schedule draft not found', 404, 'DRAFT_NOT_FOUND');
    if (current.status === 'synced') return { draft: current, replayed: true };
    return fail('Schedule draft cannot be approved', 409, 'INVALID_DRAFT_STATE');
  }

  await validateCurrentContext(draft);
  try {
    const { calendarId } = await ensureAiCalendar(userId);
    const { api } = await createGoogleCalendarClient(userId);
    const activeWriter = writer ?? createGoogleCalendarEventWriter(api);
    await syncBlocks(draft, calendarId, activeWriter);
  } catch (error) {
    mapCalendarSyncError(error);
  }
  await markTasksScheduled(draft);
  draft.status = 'synced';
  draft.syncedAt = new Date();
  await draft.save();
  return { draft, replayed: false };
};

export type ScheduleApprovalThrownError =
  | ScheduleApprovalError
  | GoogleConnectionError;
