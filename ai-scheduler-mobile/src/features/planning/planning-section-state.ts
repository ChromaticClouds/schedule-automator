import {
  planningSectionEmptyMessages,
  planningSectionErrorMessages,
  type PlanningSectionTitle,
} from './planning-empty-state';

export function sectionState(
  title: PlanningSectionTitle,
  query: { isLoading: boolean; error: Error | null; data?: unknown[] },
) {
  return {
    empty: (query.data?.length ?? 0) === 0,
    emptyMessage: planningSectionEmptyMessages[title],
    error: query.error,
    errorMessage: planningSectionErrorMessages[title],
    isLoading: query.isLoading,
    title,
  };
}
