import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { AuthPanel } from '@/features/auth/auth-panel';
import { useAuthStore } from '@/features/auth/session';
import { DailyReviewPanel } from './daily-review-panel';
import { GoalBreakdownPanel } from './goal-breakdown-panel';
import {
  useCreateGoal,
  useCreateProtectedTime,
  useCreateTask,
  useGoals,
  useProtectedTimes,
  useTasks,
} from './hooks';
import { PlanningSection } from './planning-section';
import { ScheduleDraftPanel } from './schedule-draft-panel';
import { TaskSummaryPanel } from './task-summary-panel';
import { WeeklyReschedulePanel } from './weekly-reschedule-panel';

export function PlanningDashboard() {
  const authenticated = useAuthStore(
    (state) => state.status === 'authenticated',
  );
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
    createGoal.mutate({ title: goalTitle.trim(), importance: 3 });
    setGoalTitle('');
  };

  const submitTask = () => {
    if (!taskTitle.trim()) return;
    createTask.mutate({
      title: taskTitle.trim(),
      estimatedMinutes: 60,
      importance: 3,
      goalImpact: 3,
      energyLevel: 'medium',
    });
    setTaskTitle('');
  };

  const submitProtected = () => {
    if (!protectedTitle.trim()) return;
    createProtectedTime.mutate({
      title: protectedTitle.trim(),
      category: 'custom',
      startTime: '22:00',
      endTime: '23:00',
      daysOfWeek: [1, 2, 3, 4, 5],
      protectionLevel: 'hard',
    });
    setProtectedTitle('');
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">Weekly planning</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Goals, tasks, and protected time for the current week.
        </ThemedText>
      </ThemedView>

      <AuthPanel />

      {authenticated && <ScheduleDraftPanel />}
      {authenticated && <DailyReviewPanel />}
      {authenticated && <WeeklyReschedulePanel />}
      {authenticated && <TaskSummaryPanel />}
      {authenticated && <GoalBreakdownPanel />}

      {authenticated && <PlanningSection {...sectionState('Goals', goals)}>
        <CreateRow value={goalTitle} onChange={setGoalTitle} onSubmit={submitGoal} />
        {goals.data?.map((goal) => <Item key={goal._id} text={goal.title} />)}
      </PlanningSection>}

      {authenticated && <PlanningSection {...sectionState('Tasks', tasks)}>
        <CreateRow value={taskTitle} onChange={setTaskTitle} onSubmit={submitTask} />
        {tasks.data?.map((task) => (
          <Item key={task._id} text={`${task.title} - ${task.estimatedMinutes}m`} />
        ))}
      </PlanningSection>}

      {authenticated && <PlanningSection {...sectionState('Protected time', protectedTimes)}>
        <CreateRow
          value={protectedTitle}
          onChange={setProtectedTitle}
          onSubmit={submitProtected}
        />
        {protectedTimes.data?.map((block) => (
          <Item key={block._id} text={`${block.title} ${block.startTime}-${block.endTime}`} />
        ))}
      </PlanningSection>}
    </ScrollView>
  );
}

function sectionState(title: string, query: { isLoading: boolean; error: Error | null; data?: unknown[] }) {
  return { title, isLoading: query.isLoading, error: query.error, empty: (query.data?.length ?? 0) === 0 };
}

function CreateRow({ value, onChange, onSubmit }: { value: string; onChange: (value: string) => void; onSubmit: () => void }) {
  return (
    <ThemedView style={styles.row}>
      <TextInput value={value} onChangeText={onChange} placeholder="Add item" style={styles.input} />
      <Pressable onPress={onSubmit} style={styles.button}>
        <ThemedText type="smallBold">Add</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function Item({ text }: { text: string }) {
  return <ThemedText type="small">{text}</ThemedText>;
}

const styles = StyleSheet.create({
  content: { gap: Spacing.three, paddingTop: Spacing.three },
  header: { gap: Spacing.one },
  row: { flexDirection: 'row', gap: Spacing.two, backgroundColor: 'transparent' },
  input: { flex: 1, borderWidth: 1, borderColor: '#9AA0A6', borderRadius: 8, padding: Spacing.two },
  button: { justifyContent: 'center', paddingHorizontal: Spacing.three, borderRadius: 8, backgroundColor: '#DCEBFF' },
});
