import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { PlanningButton, PlanningTextInput } from './planning-controls';
import type { Task } from './types';

type Props = {
  isDeleting: boolean;
  isUpdating: boolean;
  onDelete: () => void;
  onUpdate: (title: string, estimatedMinutes: number) => void;
  task: Task;
};

export function TaskManageItem({
  isDeleting,
  isUpdating,
  onDelete,
  onUpdate,
  task,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [minutes, setMinutes] = useState(String(task.estimatedMinutes));
  const parsedMinutes = Number.parseInt(minutes, 10);
  const valid = Boolean(title.trim()) &&
    Number.isInteger(parsedMinutes) &&
    parsedMinutes >= 5 &&
    parsedMinutes <= 480;

  if (editing) {
    return (
      <ThemedView style={styles.card} type="backgroundSelected">
        <PlanningTextInput value={title} onChangeText={setTitle} />
        <PlanningTextInput
          keyboardType="number-pad"
          maxLength={3}
          value={minutes}
          onChangeText={setMinutes}
        />
        {!valid && (
          <ThemedText type="small" themeColor="danger">
            제목과 5~480분 사이 시간을 입력해 주세요.
          </ThemedText>
        )}
        <View style={styles.actions}>
          <PlanningButton
            disabled={isUpdating || !valid}
            label={isUpdating ? '저장 중...' : '저장'}
            onPress={() => onUpdate(title.trim(), parsedMinutes)}
          />
          <PlanningButton label="취소" onPress={() => setEditing(false)} selected />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.card} type="backgroundSelected">
      <ThemedText type="smallBold">{task.title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        예상 {task.estimatedMinutes}분 · 상태 {task.status}
      </ThemedText>
      <View style={styles.actions}>
        <PlanningButton label="수정" onPress={() => setEditing(true)} selected />
        <PlanningButton
          disabled={isDeleting}
          label={isDeleting ? '삭제 중...' : '삭제'}
          onPress={onDelete}
          selected
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  card: { borderRadius: 12, gap: Spacing.two, padding: Spacing.two },
});
