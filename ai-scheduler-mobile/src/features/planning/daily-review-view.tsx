import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { PlanningButton, PlanningTextInput } from './planning-controls';
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
      <ThemedText type="smallBold">하루 마감 리뷰</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">{date}</ThemedText>
      {isLoading && <ThemedText type="small">오늘 예정된 작업을 불러오는 중...</ThemedText>}
      {errorMessage && <ThemedText type="small">{errorMessage}</ThemedText>}
      {tasks?.length === 0 && (
        <ThemedText type="small">아직 리뷰할 예정 작업이 없습니다. 먼저 일정 초안을 완료하세요.</ThemedText>
      )}
      {tasks?.map((task) => (
        <ReviewTask
          key={task._id}
          onSelect={(state) => onSelect(task._id, state)}
          state={states[task._id]}
          task={task}
        />
      ))}
      <PlanningTextInput
        multiline
        onChangeText={onNotesChange}
        placeholder="선택 메모: 미룬 이유나 내일 반영할 내용을 적어주세요"
        style={styles.notes}
        value={notes}
      />
      <PlanningButton
        disabled={saveIsPending}
        label={saveIsPending ? '저장 중...' : '리뷰 저장'}
        onPress={onSave}
        style={styles.save}
      />
      {saveErrorMessage && <ThemedText type="small">{saveErrorMessage}</ThemedText>}
      {saveIsSuccess && (
        <ThemedText type="small">리뷰가 저장되었습니다. 미룬 작업을 다시 배치할 수 있습니다.</ThemedText>
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
        <Choice active={state === 'completed'} label="완료" onPress={() => onSelect('completed')} />
        <Choice active={state === 'missed'} label="미룸" onPress={() => onSelect('missed')} />
      </ThemedView>
    </ThemedView>
  );
}

function Choice({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return <PlanningButton label={label} onPress={onPress} selected={active} />;
}

const styles = StyleSheet.create({
  actions: { backgroundColor: 'transparent', flexDirection: 'row', gap: Spacing.two },
  notes: { minHeight: 64 },
  panel: { borderRadius: Spacing.two, gap: Spacing.two, padding: Spacing.three },
  save: { alignSelf: 'flex-start', borderRadius: 8, padding: Spacing.two },
  task: { backgroundColor: 'transparent', gap: Spacing.one },
});
