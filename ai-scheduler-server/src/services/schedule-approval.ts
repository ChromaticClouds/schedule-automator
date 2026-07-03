import { Types } from 'mongoose';
import { ScheduleDraftModel } from '@/models/index.js';
import { ensureAiCalendar } from './ai-calendar.js';
import {
  createGoogleCalendarClient,
  type GoogleConnectionError,
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

export const approveScheduleDraft = async (
  userId: Types.ObjectId,
  draftId: Types.ObjectId,
  writer?: CalendarEventWriter,
) => {
  const draft = await ScheduleDraftModel.findOne({ _id: draftId, userId });
  if (!draft) return fail('Schedule draft not found', 404, 'DRAFT_NOT_FOUND');
  if (!['draft', 'approved', 'synced'].includes(draft.status)) {
    return fail('Schedule draft cannot be approved', 409, 'INVALID_DRAFT_STATE');
  }
  if (draft.status === 'synced') return { draft, replayed: true };

  const { calendarId } = await ensureAiCalendar(userId);
  const { api } = await createGoogleCalendarClient(userId);
  const activeWriter = writer ?? createGoogleCalendarEventWriter(api);
  const now = new Date();

  draft.status = 'approved';
  draft.approvedAt ??= now;
  for (const block of draft.blocks) {
    if (block.status === 'draft') block.status = 'approved';
  }
  await draft.save();

  await syncBlocks(draft, calendarId, activeWriter);
  draft.status = 'synced';
  draft.syncedAt = new Date();
  await draft.save();
  return { draft, replayed: false };
};

export type ScheduleApprovalThrownError =
  | ScheduleApprovalError
  | GoogleConnectionError;
