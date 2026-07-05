import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { useToast } from '@/components/toast-provider';
import { planningErrorMessage } from './api-feedback';
import { useCreateGoal, useGoals } from './hooks';
import { PlanningCreateRow } from './planning-create-row';
import { PlanningSection } from './planning-section';
import { sectionState } from './planning-section-state';

export function PlanningGoalCreateSection() {
  const { showToast } = useToast();
  const [goalTitle, setGoalTitle] = useState('');
  const goals = useGoals();
  const createGoal = useCreateGoal();
  const submitGoal = () => {
    if (!goalTitle.trim()) return;
    createGoal.mutate(
      { title: goalTitle.trim(), importance: 3 },
      {
        onError: (error) =>
          showToast({
            kind: 'error',
            message: planningErrorMessage(error, '목표를 저장하지 못했습니다.'),
          }),
        onSuccess: () => {
          setGoalTitle('');
          showToast({ kind: 'success', message: '목표를 추가했습니다.' });
        },
      },
    );
  };

  return (
    <PlanningSection {...sectionState('목표', goals)}>
      <PlanningCreateRow
        emptyMessage="추가할 목표 제목을 먼저 입력해 주세요."
        errorMessage={
          createGoal.error
            ? planningErrorMessage(createGoal.error, '목표를 저장하지 못했습니다.')
            : undefined
        }
        guideText="예: 이번 주 포트폴리오 README를 개선하고 리팩터링을 마무리한다"
        isPending={createGoal.isPending}
        onChange={(value) => {
          createGoal.reset();
          setGoalTitle(value);
        }}
        onSubmit={submitGoal}
        placeholder="주간 목표를 입력하세요"
        value={goalTitle}
      />
      {goals.data?.map((goal) => (
        <ThemedText key={goal._id} type="small">
          {goal.title}
        </ThemedText>
      ))}
    </PlanningSection>
  );
}
