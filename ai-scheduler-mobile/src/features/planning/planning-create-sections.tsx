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
import { planningSectionEmptyMessages, planningSectionErrorMessages, type PlanningSectionTitle } from './planning-empty-state';
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
      <PlanningSection {...sectionState('Goals', goals)}>
        <PlanningCreateRow
          emptyMessage="Enter a goal title before adding it."
          errorMessage={createGoal.error ? 'Goal could not be saved. Try again.' : undefined}
          isPending={createGoal.isPending}
          onChange={(value) => {
            createGoal.reset();
            setGoalTitle(value);
          }}
          onSubmit={submitGoal}
          placeholder="Add a weekly goal"
          value={goalTitle}
        />
        {goals.data?.map((goal) => <Item key={goal._id} text={goal.title} />)}
      </PlanningSection>
      <PlanningSection {...sectionState('Tasks', tasks)}>
        <PlanningCreateRow
          emptyMessage="Enter a task title before adding it."
          errorMessage={createTask.error ? 'Task could not be saved. Try again.' : undefined}
          isPending={createTask.isPending}
          onChange={(value) => {
            createTask.reset();
            setTaskTitle(value);
          }}
          onSubmit={submitTask}
          placeholder="Add a task"
          value={taskTitle}
        />
        {tasks.data?.map((task) => (
          <Item key={task._id} text={`${task.title} - ${task.estimatedMinutes}m`} />
        ))}
      </PlanningSection>
      <PlanningSection {...sectionState('Protected time', protectedTimes)}>
        <PlanningCreateRow
          emptyMessage="Enter a protected-time title before adding it."
          errorMessage={createProtectedTime.error ? 'Protected time could not be saved. Try again.' : undefined}
          isPending={createProtectedTime.isPending}
          onChange={(value) => {
            createProtectedTime.reset();
            setProtectedTitle(value);
          }}
          onSubmit={submitProtected}
          placeholder="Add protected time"
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
