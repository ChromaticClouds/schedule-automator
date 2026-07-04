import { useTaskSummary } from './hooks';
import { TaskSummaryView } from './task-summary-view';

const errorMessage =
  'Task summary could not be loaded. Try again after refreshing tasks.';

export function TaskSummaryPanel() {
  const query = useTaskSummary();

  return (
    <TaskSummaryView
      errorMessage={query.error ? errorMessage : undefined}
      isLoading={query.isLoading}
      summary={query.data}
    />
  );
}
