import { useTaskSummary } from './hooks';
import { TaskSummaryView } from './task-summary-view';

const errorMessage =
  '작업 요약을 불러오지 못했습니다. 작업을 새로고침한 뒤 다시 시도하세요.';

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
