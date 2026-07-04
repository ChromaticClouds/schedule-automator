import * as Crypto from 'expo-crypto';
import { useState } from 'react';
import { useTasks } from './hooks';
import { toScheduleDateKey } from './schedule-date';
import { useWeeklyReschedule } from './weekly-reschedule-hooks';
import {
  hasUnprocessedMissedTasks,
  weeklyRescheduleErrorMessage,
} from './weekly-reschedule-state';
import { WeeklyRescheduleView } from './weekly-reschedule-view';

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
      errorMessage={weeklyRescheduleErrorMessage(mutation.error)}
      isPending={mutation.isPending}
      onRun={run}
      result={mutation.data}
      taskNames={taskNames}
    />
  );
}
