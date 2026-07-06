import { Types } from 'mongoose';
import type { ScheduleDraftOutput } from './schedule-draft.schema.js';
import type { ScheduleContext } from './schedule-contract.js';
import { addDays, zonedDateTime } from '@/services/schedule-time.js';

type Interval = { end: string; start: string };

const toMs = (value: string) => Date.parse(value);

const minutesBetween = (start: string, end: string) =>
  (toMs(end) - toMs(start)) / 60_000;

const overlaps = (left: Interval, right: Interval) =>
  toMs(left.start) < toMs(right.end) && toMs(right.start) < toMs(left.end);

const inDay = (
  date: string,
  timezone: string,
  block: Interval,
) => {
  const start = toMs(zonedDateTime(date, '00:00:00.000', timezone));
  const end = toMs(
    zonedDateTime(addDays(date, 1), '00:00:00.000', timezone),
  );
  return toMs(block.start) >= start && toMs(block.end) <= end;
};

export const validateScheduleDraft = (
  output: ScheduleDraftOutput,
  context: ScheduleContext,
) => {
  const allowedTasks = new Set(context.tasks.map(({ id }) => id));
  const blocked = [
    ...context.busy.map(({ end, start }) => ({ end, start })),
    ...context.protected,
  ];
  let taskMinutes = 0;

  const sorted = [...output.blocks].sort(
    (left, right) => toMs(left.start) - toMs(right.start),
  );

  for (const [index, block] of sorted.entries()) {
    if (
      !inDay(context.date, context.timezone, block) ||
      toMs(block.end) <= toMs(block.start)
    ) {
      return { ok: false as const, reason: 'invalid_time_range' };
    }
    if (block.taskId && !allowedTasks.has(block.taskId)) {
      return { ok: false as const, reason: 'invalid_task_reference' };
    }
    if (block.taskId && !Types.ObjectId.isValid(block.taskId)) {
      return { ok: false as const, reason: 'invalid_task_reference' };
    }
    if (blocked.some((candidate) => overlaps(block, candidate))) {
      return { ok: false as const, reason: 'blocked_time_collision' };
    }
    if (index > 0 && overlaps(sorted[index - 1], block)) {
      return { ok: false as const, reason: 'schedule_overlap' };
    }
    if (block.type === 'task') taskMinutes += minutesBetween(block.start, block.end);
  }

  if (taskMinutes > context.maxDailyWorkMinutes) {
    return { ok: false as const, reason: 'daily_work_limit_exceeded' };
  }

  return { blocks: sorted, ok: true as const };
};
