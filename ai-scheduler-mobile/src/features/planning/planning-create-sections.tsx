import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import {
  useCreateGoal,
  useCreateProtectedTime,
  useCreateTask,
  useGoals,
  useProtectedTimes,
  useTasks,
} from './hooks';
import { PlanningCreateRow } from './planning-create-row';
import {
  planningSectionEmptyMessages,
  planningSectionErrorMessages,
  type PlanningSectionTitle,
} from './planning-empty-state';
import { PlanningSection } from './planning-section';

export function PlanningCreateSections() {
  const [goalTitle, setGoalTitle] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [protectedTitle, setProtectedTitle] = useState('');
  const goals = useGoals();
  const tasks = useTasks();
  const protectedTimes = useProtectedTimes();
  const createGoal = useCreateGoal();
  const createTask = useCreateTask();
  const createProtectedTime = useCreateProtectedTime();

  const submitGoal = () => {
    if (!goalTitle.trim()) return;
    createGoal.mutate(
      { title: goalTitle.trim(), importance: 3 },
      { onSuccess: () => setGoalTitle('') },
    );
  };

  const submitTask = () => {
    if (!taskTitle.trim()) return;
    createTask.mutate(
      {
        energyLevel: 'medium',
        estimatedMinutes: 60,
        goalImpact: 3,
        importance: 3,
        title: taskTitle.trim(),
      },
      { onSuccess: () => setTaskTitle('') },
    );
  };

  const submitProtected = () => {
    if (!protectedTitle.trim()) return;
    createProtectedTime.mutate(
      {
        category: 'custom',
        daysOfWeek: [1, 2, 3, 4, 5],
        endTime: '23:00',
        protectionLevel: 'hard',
        startTime: '22:00',
        title: protectedTitle.trim(),
      },
      { onSuccess: () => setProtectedTitle('') },
    );
  };

  return (
    <>
      <PlanningSection {...sectionState('목표', goals)}>
        <PlanningCreateRow
          emptyMessage="추가할 목표 제목을 먼저 입력하세요."
          errorMessage={createGoal.error ? '목표를 저장하지 못했습니다. 다시 시도하세요.' : undefined}
          guideText="예: 이번 주 포트폴리오 README를 개선하고 재고 관리 리팩터링을 마무리한다"
          isPending={createGoal.isPending}
          onChange={(value) => {
            createGoal.reset();
            setGoalTitle(value);
          }}
          onSubmit={submitGoal}
          placeholder="주간 목표를 입력하세요"
          value={goalTitle}
        />
        {goals.data?.map((goal) => <Item key={goal._id} text={goal.title} />)}
      </PlanningSection>
      <PlanningSection {...sectionState('작업', tasks)}>
        <PlanningCreateRow
          emptyMessage="추가할 작업 제목을 먼저 입력하세요."
          errorMessage={createTask.error ? '작업을 저장하지 못했습니다. 다시 시도하세요.' : undefined}
          guideText="예: README에 실행 방법과 주요 기능 설명을 추가한다 - 60분"
          isPending={createTask.isPending}
          onChange={(value) => {
            createTask.reset();
            setTaskTitle(value);
          }}
          onSubmit={submitTask}
          placeholder="작업을 입력하세요"
          value={taskTitle}
        />
        {tasks.data?.map((task) => (
          <Item key={task._id} text={`${task.title} - ${task.estimatedMinutes}분`} />
        ))}
      </PlanningSection>
      <PlanningSection {...sectionState('보호 시간', protectedTimes)}>
        <PlanningCreateRow
          emptyMessage="보호 시간 이름을 먼저 입력하세요."
          errorMessage={createProtectedTime.error ? '보호 시간을 저장하지 못했습니다. 다시 시도하세요.' : undefined}
          guideText="예: 점심 식사 12:00-13:00, 운동 19:00-20:00"
          isPending={createProtectedTime.isPending}
          onChange={(value) => {
            createProtectedTime.reset();
            setProtectedTitle(value);
          }}
          onSubmit={submitProtected}
          placeholder="보호 시간을 입력하세요"
          value={protectedTitle}
        />
        {protectedTimes.data?.map((block) => (
          <Item key={block._id} text={`${block.title} ${block.startTime}-${block.endTime}`} />
        ))}
      </PlanningSection>
    </>
  );
}

function sectionState(
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

function Item({ text }: { text: string }) {
  return <ThemedText type="small">{text}</ThemedText>;
}
