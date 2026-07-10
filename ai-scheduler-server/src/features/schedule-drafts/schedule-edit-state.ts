export type DraftEditState = {
  assumptions: string[];
  blocks: Array<{
    _id: { toString(): string };
    end: Date;
    reason?: string | null;
    source: string;
    start: Date;
    taskId?: { toString(): string } | null;
    title: string;
    type: string;
  }>;
  date: string;
  status: string;
  summary?: string | null;
  updatedAt: Date;
  userId: { toString(): string };
  warnings: string[];
};

export type ScheduleEditIssue = {
  code: string;
  message: string;
  statusCode: number;
};

export class ScheduleEditError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'ScheduleEditError';
  }
}

export const throwScheduleEditIssue = (
  issue: ScheduleEditIssue,
): never => {
  throw new ScheduleEditError(issue.message, issue.statusCode, issue.code);
};

export const scheduleEditGuard = (
  draft: DraftEditState | null,
  userId: string,
  blockId: string,
  expectedUpdatedAt: string,
): ScheduleEditIssue | undefined => {
  if (!draft || draft.userId.toString() !== userId) {
    return {
      code: 'DRAFT_NOT_FOUND',
      message: 'Schedule draft not found',
      statusCode: 404,
    };
  }
  if (draft.status !== 'draft') {
    return {
      code: 'INVALID_DRAFT_STATE',
      message: 'Schedule draft cannot be edited',
      statusCode: 409,
    };
  }
  if (
    draft.updatedAt.toISOString() !==
    new Date(expectedUpdatedAt).toISOString()
  ) {
    return {
      code: 'STALE_DRAFT_VERSION',
      message: 'Schedule draft changed',
      statusCode: 409,
    };
  }
  const block = draft.blocks.find(({ _id }) => _id.toString() === blockId);
  if (!block) {
    return {
      code: 'DRAFT_BLOCK_NOT_FOUND',
      message: 'Schedule block not found',
      statusCode: 404,
    };
  }
  if (block.source !== 'ai' || !['task', 'break'].includes(block.type)) {
    return {
      code: 'DRAFT_BLOCK_NOT_EDITABLE',
      message: 'Schedule block cannot be edited',
      statusCode: 409,
    };
  }
};
