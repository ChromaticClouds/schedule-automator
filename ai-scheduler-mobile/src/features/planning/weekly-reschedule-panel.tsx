import * as Crypto from 'expo-crypto';
import { useState } from 'react';
import { ApiError } from '@/api';
import { useTasks } from './hooks';
import { toScheduleDateKey } from './schedule-date';
import { useWeeklyReschedule } from './weekly-reschedule-hooks';
import { hasUnprocessedMissedTasks } from './weekly-reschedule-state';
import { WeeklyRescheduleView } from './weekly-reschedule-view';

const errorMessage = (error: Error | null) => {
  if (!(error instanceof ApiError)) return error?.message;
  const details = error.details as { details?: { code?: unknown } } | null;
  const code = details?.details?.code;
  if (code === 'REQUEST_IN_PROGRESS') return 'A weekly replan is already running.';
  if (code === 'IDEMPOTENCY_CONFLICT') return 'Planning context changed. Try again.';
  if (code === 'REPLAN_PROVIDER_ERROR') return 'The planning provider is unavailable.';
  if (code === 'REPLAN_VALIDATION_ERROR') return 'The generated plan was not safe to use.';
  return error.message;
};

export function WeeklyReschedulePanel() {
  const reviewDate = toScheduleDateKey();
  const tasks = useTasks();
  const mutation = useWeeklyReschedule(reviewDate);
  const [processedTaskIds, setProcessedTaskIds] = useState<string[]>([]);
  const taskNames = Object.fromEntries(
    (tasks.data ?? []).map((task) => [task._id, task.title]),
  );
  const missedTaskIds = (tasks.data ?? [])
    .filter(({ status }) => status === 'missed')
    .map(({ _id }) => _id);
  const canRun = mutation.isSuccess
    ? hasUnprocessedMissedTasks(missedTaskIds, processedTaskIds)
    : missedTaskIds.length > 0;

  const run = () => {
    setProcessedTaskIds(missedTaskIds);
    mutation.mutate(`weekly-replan:${reviewDate}:${Crypto.randomUUID()}`);
  };

  return (
    <WeeklyRescheduleView
      disabled={!canRun}
      errorMessage={errorMessage(mutation.error)}
      isPending={mutation.isPending}
      onRun={run}
      result={mutation.data}
      taskNames={taskNames}
    />
  );
}
