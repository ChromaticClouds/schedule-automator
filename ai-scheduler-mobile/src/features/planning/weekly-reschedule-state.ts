export const hasUnprocessedMissedTasks = (
  currentTaskIds: string[],
  processedTaskIds: string[],
) => {
  const processed = new Set(processedTaskIds);
  return currentTaskIds.some((taskId) => !processed.has(taskId));
};
