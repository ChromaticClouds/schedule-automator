import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Task } from './types';

export type DailyReviewTaskState = 'completed' | 'missed' | undefined;

export type DailyReviewViewProps = {
  date: string;
  errorMessage?: string;
  isLoading: boolean;
  notes: string;
  onNotesChange: (value: string) => void;
  onSave: () => void;
  onSelect: (taskId: string, state: Exclude<DailyReviewTaskState, undefined>) => void;
  saveErrorMessage?: string;
  saveIsPending: boolean;
  saveIsSuccess: boolean;
  states: Record<string, DailyReviewTaskState>;
  tasks?: Task[];
};

export function DailyReviewView({
  date,
  errorMessage,
  isLoading,
  notes,
  onNotesChange,
  onSave,
  onSelect,
  saveErrorMessage,
  saveIsPending,
  saveIsSuccess,
  states,
  tasks,
}: DailyReviewViewProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.panel}>
      <ThemedText type="smallBold">End-of-day review</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">{date}</ThemedText>
      {isLoading && <ThemedText type="small">Loading today&apos;s scheduled tasks...</ThemedText>}
      {errorMessage && <ThemedText type="small">{errorMessage}</ThemedText>}
      {tasks?.length === 0 && (
        <ThemedText type="small">No scheduled tasks need review yet. Complete a schedule draft first.</ThemedText>
      )}
      {tasks?.map((task) => (
        <ReviewTask
          key={task._id}
          onSelect={(state) => onSelect(task._id, state)}
          state={states[task._id]}
          task={task}
        />
      ))}
      <TextInput
        multiline
        onChangeText={onNotesChange}
        placeholder="Optional notes"
        style={styles.notes}
        value={notes}
      />
      <Pressable disabled={saveIsPending} onPress={onSave} style={styles.save}>
        <ThemedText type="smallBold">{saveIsPending ? 'Saving...' : 'Save review'}</ThemedText>
      </Pressable>
      {saveErrorMessage && <ThemedText type="small">{saveErrorMessage}</ThemedText>}
      {saveIsSuccess && (
        <ThemedText type="small">Review saved. Missed tasks can now be replanned.</ThemedText>
      )}
    </ThemedView>
  );
}

function ReviewTask({
  onSelect,
  state,
  task,
}: {
  onSelect: (state: Exclude<DailyReviewTaskState, undefined>) => void;
  state: DailyReviewTaskState;
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

const styles = StyleSheet.create({
  actions: { backgroundColor: 'transparent', flexDirection: 'row', gap: Spacing.two },
  active: { backgroundColor: '#B8D8FF' },
  choice: { backgroundColor: '#DCEBFF', borderRadius: 8, padding: Spacing.two },
  notes: { borderColor: '#9AA0A6', borderRadius: 8, borderWidth: 1, minHeight: 64, padding: Spacing.two },
  panel: { borderRadius: Spacing.two, gap: Spacing.two, padding: Spacing.three },
  save: { alignSelf: 'flex-start', backgroundColor: '#DCEBFF', borderRadius: 8, padding: Spacing.two },
  task: { backgroundColor: 'transparent', gap: Spacing.one },
});
