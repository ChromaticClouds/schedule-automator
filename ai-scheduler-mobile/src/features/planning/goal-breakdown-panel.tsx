import { useRef } from 'react';
import * as Crypto from 'expo-crypto';
import { useToast } from '@/components/toast-provider';
import { useGoalBreakdown } from './goal-breakdown-hooks';
import {
  goalBreakdownErrorCode,
  goalBreakdownErrorFeedback,
  goalBreakdownSuccessFeedback,
} from './goal-breakdown-state';
import { GoalBreakdownView } from './goal-breakdown-view';
import { useGoals } from './hooks';

export function GoalBreakdownPanel() {
  const { showToast } = useToast();
  const goals = useGoals();
  const mutation = useGoalBreakdown();
  const requestKeys = useRef(new Map<string, string>());
  const activeGoals = goals.data?.filter(({ status }) => status === 'active') ?? [];
  const feedback = mutation.error
    ? goalBreakdownErrorFeedback(mutation.error)
    : mutation.data
      ? goalBreakdownSuccessFeedback(mutation.data)
      : goals.error
        ? { kind: 'error' as const, message: '목표를 불러오지 못했습니다.' }
        : undefined;

  const generate = (goalId: string) => {
    const currentKey = requestKeys.current.get(goalId);
    const idempotencyKey =
      currentKey ?? `goal-breakdown:${goalId}:${Crypto.randomUUID()}`;
    requestKeys.current.set(goalId, idempotencyKey);
    mutation.mutate(
      { goalId, idempotencyKey },
      {
        onError: (error) => {
          showToast({
            kind: 'error',
            message: goalBreakdownErrorFeedback(error).message,
          });
          if (goalBreakdownErrorCode(error) === 'IDEMPOTENCY_CONFLICT') {
            requestKeys.current.delete(goalId);
          }
        },
        onSuccess: (result) => {
          requestKeys.current.delete(goalId);
          showToast({
            kind: 'success',
            message: goalBreakdownSuccessFeedback(result).message,
          });
        },
      },
    );
  };

  return (
    <GoalBreakdownView
      busyGoalId={mutation.isPending ? mutation.variables?.goalId : undefined}
      feedback={feedback}
      goals={activeGoals}
      isLoading={goals.isLoading}
      onGenerate={generate}
    />
  );
}
