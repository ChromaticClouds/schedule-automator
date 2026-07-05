import { useEffect, useState } from 'react';

import {
  DailyReviewView,
  type DailyReviewTaskState,
} from './daily-review-view';
import { useDailyReview, useSaveDailyReview } from './review-hooks';
import { toScheduleDateKey } from './schedule-date';

const loadErrorMessage =
  '일일 리뷰를 불러오지 못했습니다. 작업을 새로고침한 뒤 다시 시도하세요.';
const saveErrorMessage =
  '리뷰를 저장하지 못했습니다. 주간 재배치 전에 다시 시도하세요.';

export function DailyReviewPanel() {
  const date = toScheduleDateKey();
  const query = useDailyReview(date);
  const save = useSaveDailyReview(date);
  const [states, setStates] = useState<Record<string, DailyReviewTaskState>>({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const review = query.data?.review;
    if (!review) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setStates({
        ...Object.fromEntries(
          review.completedTaskIds.map((id) => [id, 'completed']),
        ),
        ...Object.fromEntries(review.missedTaskIds.map((id) => [id, 'missed'])),
      });
      setNotes(review.notes ?? '');
    });
    return () => {
      active = false;
    };
  }, [query.data?.review]);

  const select = (
    taskId: string,
    state: Exclude<DailyReviewTaskState, undefined>,
  ) => setStates((current) => ({
    ...current,
    [taskId]: current[taskId] === state ? undefined : state,
  }));

  const submit = () => save.mutate({
    completedTaskIds: selectedIds(states, 'completed'),
    missedTaskIds: selectedIds(states, 'missed'),
    notes: notes.trim(),
  });

  return (
    <DailyReviewView
      date={date}
      errorMessage={query.error ? loadErrorMessage : undefined}
      isLoading={query.isLoading}
      notes={notes}
      onNotesChange={setNotes}
      onSave={submit}
      onSelect={select}
      saveErrorMessage={save.error ? saveErrorMessage : undefined}
      saveIsPending={save.isPending}
      saveIsSuccess={save.isSuccess}
      states={states}
      tasks={query.data?.tasks}
    />
  );
}

const selectedIds = (
  states: Record<string, DailyReviewTaskState>,
  state: Exclude<DailyReviewTaskState, undefined>,
) => Object.entries(states).filter(([, value]) => value === state).map(([id]) => id);
