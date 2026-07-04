import type { WeeklyRescheduleOutput } from '@/schemas/weekly-reschedule.js';
import type { WeeklyRescheduleContext } from './weekly-reschedule-contract.js';

type Interval = { end: string; start: string };

const toMs = (value: string) => Date.parse(value);
const overlaps = (left: Interval, right: Interval) =>
  toMs(left.start) < toMs(right.end) && toMs(right.start) < toMs(left.end);
const durationMinutes = ({ start, end }: Interval) =>
  (toMs(end) - toMs(start)) / 60_000;

export const validateWeeklyReschedule = (
  output: WeeklyRescheduleOutput,
  context: WeeklyRescheduleContext,
) => {
  const tasks = new Map(context.tasks.map((task) => [task.id, task]));
  const days = new Map(context.days.map((day) => [day.date, day]));
  const returnedIds = [
    ...output.placements.map(({ taskId }) => taskId),
    ...output.overflowTaskIds,
  ];
  if (
    returnedIds.length !== tasks.size ||
    returnedIds.some((taskId) => !tasks.has(taskId))
  ) {
    return { ok: false as const, reason: 'invalid_task_reference' };
  }

  const placementsByDate = new Map<
    string,
    WeeklyRescheduleOutput['placements']
  >();
  for (const placement of output.placements) {
    placementsByDate.set(placement.date, [
      ...(placementsByDate.get(placement.date) ?? []),
      placement,
    ]);
  }
  for (const [date, placements] of placementsByDate) {
    const day = days.get(date);
    if (!day || !day.acceptsDraftChanges) {
      return { ok: false as const, reason: 'invalid_schedule_date' };
    }
    const sorted = [...placements].sort(
      (left, right) => toMs(left.start) - toMs(right.start),
    );
    let taskMinutes = day.scheduledTaskMinutes;
    for (const [index, placement] of sorted.entries()) {
      const task = tasks.get(placement.taskId);
      if (
        !task ||
        !placement.start.startsWith(date) ||
        toMs(placement.end) <= toMs(placement.start)
      ) {
        return { ok: false as const, reason: 'invalid_time_range' };
      }
      if (durationMinutes(placement) !== task.estimatedMinutes) {
        return { ok: false as const, reason: 'invalid_task_duration' };
      }
      if (day.blocked.some((interval) => overlaps(placement, interval))) {
        return { ok: false as const, reason: 'blocked_time_collision' };
      }
      if (index > 0 && overlaps(sorted[index - 1], placement)) {
        return { ok: false as const, reason: 'schedule_overlap' };
      }
      taskMinutes += durationMinutes(placement);
    }
    if (taskMinutes > day.maxDailyWorkMinutes) {
      return { ok: false as const, reason: 'daily_work_limit_exceeded' };
    }
  }

  return { ok: true as const, output };
};
