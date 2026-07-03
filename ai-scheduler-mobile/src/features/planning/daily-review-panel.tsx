import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDailyReview, useSaveDailyReview } from './review-hooks';
import { toScheduleDateKey } from './schedule-date';
import type { Task } from './types';

type TaskState = 'completed' | 'missed' | undefined;

export function DailyReviewPanel() {
  const date = toScheduleDateKey();
  const query = useDailyReview(date);
  const save = useSaveDailyReview(date);
  const [states, setStates] = useState<Record<string, TaskState>>({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const review = query.data?.review;
    if (!review) return;
    setStates({
      ...Object.fromEntries(
        review.completedTaskIds.map((id) => [id, 'completed']),
      ),
      ...Object.fromEntries(review.missedTaskIds.map((id) => [id, 'missed'])),
    });
    setNotes(review.notes ?? '');
  }, [query.data?.review]);

  const select = (taskId: string, state: TaskState) =>
    setStates((current) => ({
      ...current,
      [taskId]: current[taskId] === state ? undefined : state,
    }));

  const submit = () => save.mutate({
    completedTaskIds: selectedIds(states, 'completed'),
    missedTaskIds: selectedIds(states, 'missed'),
    ...(notes.trim() ? { notes: notes.trim() } : {}),
  });

  return (
    <ThemedView type="backgroundElement" style={styles.panel}>
      <ThemedText type="smallBold">End-of-day review</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">{date}</ThemedText>
      {query.isLoading && <ThemedText type="small">Loading tasks...</ThemedText>}
      {query.error && <ThemedText type="small">Failed: {query.error.message}</ThemedText>}
      {query.data?.tasks.length === 0 && (
        <ThemedText type="small">No scheduled tasks to review.</ThemedText>
      )}
      {query.data?.tasks.map((task) => (
        <ReviewTask
          key={task._id}
          task={task}
          state={states[task._id]}
          onSelect={(state) => select(task._id, state)}
        />
      ))}
      <TextInput
        multiline
        onChangeText={setNotes}
        placeholder="Optional notes"
        style={styles.notes}
        value={notes}
      />
      <Pressable
        disabled={save.isPending}
        onPress={submit}
        style={styles.save}
      >
        <ThemedText type="smallBold">
          {save.isPending ? 'Saving...' : 'Save review'}
        </ThemedText>
      </Pressable>
      {save.error && <ThemedText type="small">Failed: {save.error.message}</ThemedText>}
      {save.isSuccess && <ThemedText type="small">Review saved.</ThemedText>}
    </ThemedView>
  );
}

function ReviewTask({
  onSelect,
  state,
  task,
}: {
  onSelect: (state: Exclude<TaskState, undefined>) => void;
  state: TaskState;
  task: Task;
}) {
  return (
    <ThemedView style={styles.task}>
      <ThemedText type="small">{task.title}</ThemedText>
      <ThemedView style={styles.actions}>
        <Choice active={state === 'completed'} label="Done" onPress={() => onSelect('completed')} />
        <Choice active={state === 'missed'} label="Missed" onPress={() => onSelect('missed')} />
      </ThemedView>
    </ThemedView>
  );
}

function Choice({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.choice, active && styles.active]}>
      <ThemedText type="smallBold">{label}</ThemedText>
    </Pressable>
  );
}

const selectedIds = (
  states: Record<string, TaskState>,
  state: Exclude<TaskState, undefined>,
) => Object.entries(states).filter(([, value]) => value === state).map(([id]) => id);

const styles = StyleSheet.create({
  actions: { backgroundColor: 'transparent', flexDirection: 'row', gap: Spacing.two },
  active: { backgroundColor: '#B8D8FF' },
  choice: { backgroundColor: '#DCEBFF', borderRadius: 8, padding: Spacing.two },
  notes: { borderColor: '#9AA0A6', borderRadius: 8, borderWidth: 1, minHeight: 64, padding: Spacing.two },
  panel: { borderRadius: Spacing.two, gap: Spacing.two, padding: Spacing.three },
  save: { alignSelf: 'flex-start', backgroundColor: '#DCEBFF', borderRadius: 8, padding: Spacing.two },
  task: { backgroundColor: 'transparent', gap: Spacing.one },
});
