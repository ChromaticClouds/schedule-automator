import { Types } from 'mongoose';
import { ScheduleDraftModel } from '@/models/index.js';
import type {
  ScheduleBlockEdit,
  ScheduleDraftOutput,
} from '@/schemas/schedule-draft.js';
import { buildScheduleContext } from './schedule-context.js';
import { zonedDateTime } from './schedule-time.js';
import { validateScheduleDraft } from './schedule-validation.js';
import {
  scheduleEditGuard,
  throwScheduleEditIssue,
  type DraftEditState,
} from './schedule-edit-state.js';

export { ScheduleEditError } from './schedule-edit-state.js';

export const scheduleEditOutput = (
  draft: DraftEditState,
  blockId: string,
  edit: ScheduleBlockEdit,
  timezone: string,
): ScheduleDraftOutput => ({
  assumptions: draft.assumptions,
  blocks: draft.blocks
    .filter(({ source, type }) => source === 'ai' && ['task', 'break'].includes(type))
    .map((block) => ({
      end: block._id.toString() === blockId
        ? zonedDateTime(draft.date, `${edit.endTime}:00.000`, timezone)
        : block.end.toISOString(),
      ...(block.reason ? { reason: block.reason } : {}),
      start: block._id.toString() === blockId
        ? zonedDateTime(draft.date, `${edit.startTime}:00.000`, timezone)
        : block.start.toISOString(),
      ...(block.taskId ? { taskId: block.taskId.toString() } : {}),
      title: block._id.toString() === blockId ? edit.title : block.title,
      type: block.type as 'task' | 'break',
    })),
  summary: draft.summary ?? 'Edited schedule draft',
  warnings: draft.warnings,
});

export const editScheduleDraftBlock = async (
  userId: Types.ObjectId,
  draftId: Types.ObjectId,
  blockId: Types.ObjectId,
  edit: ScheduleBlockEdit,
) => {
  const draft = await ScheduleDraftModel.findById(draftId);
  const state = draft as unknown as DraftEditState | null;
  const issue = scheduleEditGuard(
    state,
    userId.toString(),
    blockId.toString(),
    edit.expectedUpdatedAt,
  );
  if (issue) return throwScheduleEditIssue(issue);

  const context = await buildScheduleContext(userId, state!.date);
  const output = scheduleEditOutput(state!, blockId.toString(), edit, context.timezone);
  const valid = validateScheduleDraft(output, context);
  if (!valid.ok) {
    return throwScheduleEditIssue({
      code: 'DRAFT_EDIT_VALIDATION_ERROR',
      message: valid.reason,
      statusCode: 422,
    });
  }

  const updated = await ScheduleDraftModel.findOneAndUpdate(
    {
      _id: draftId,
      'blocks._id': blockId,
      status: 'draft',
      updatedAt: new Date(edit.expectedUpdatedAt),
      userId,
    },
    {
      $set: {
        'blocks.$.end': new Date(
          zonedDateTime(state!.date, `${edit.endTime}:00.000`, context.timezone),
        ),
        'blocks.$.start': new Date(
          zonedDateTime(state!.date, `${edit.startTime}:00.000`, context.timezone),
        ),
        'blocks.$.title': edit.title,
      },
    },
    { returnDocument: 'after', runValidators: true },
  );
  if (updated) return { draft: updated, replayed: false };

  const current = await ScheduleDraftModel.findById(draftId);
  return throwScheduleEditIssue(
    scheduleEditGuard(
      current as unknown as DraftEditState | null,
      userId.toString(),
      blockId.toString(),
      edit.expectedUpdatedAt,
    ) ?? {
      code: 'STALE_DRAFT_VERSION',
      message: 'Schedule draft changed',
      statusCode: 409,
    },
  );
};
