export type ReviewState = {
  completedTaskIds: string[];
  missedTaskIds: string[];
};

export type TaskReviewUpdate = {
  postponedDelta: -1 | 0 | 1;
  status: 'done' | 'missed' | 'scheduled';
  taskId: string;
};

export const buildTaskReviewUpdates = (
  previous: ReviewState,
  next: ReviewState,
): TaskReviewUpdate[] => {
  const oldCompleted = new Set(previous.completedTaskIds);
  const oldMissed = new Set(previous.missedTaskIds);
  const completed = new Set(next.completedTaskIds);
  const missed = new Set(next.missedTaskIds);
  const ids = new Set([
    ...oldCompleted,
    ...oldMissed,
    ...completed,
    ...missed,
  ]);

  return [...ids].map((taskId) => ({
    postponedDelta: missed.has(taskId)
      ? oldMissed.has(taskId) ? 0 : 1
      : oldMissed.has(taskId) ? -1 : 0,
    status: completed.has(taskId)
      ? 'done'
      : missed.has(taskId)
        ? 'missed'
        : 'scheduled',
    taskId,
  }));
};
