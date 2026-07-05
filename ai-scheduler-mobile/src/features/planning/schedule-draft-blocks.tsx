import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { PlanningButton, PlanningTextInput } from './planning-controls';
import type {
  ScheduleBlock,
  ScheduleBlockEditInput,
  ScheduleDraft,
} from './types';

type EditForm = Omit<ScheduleBlockEditInput, 'expectedUpdatedAt'>;

type Props = {
  busy: boolean;
  draft: ScheduleDraft;
  onEdit: (
    draftId: string,
    blockId: string,
    body: ScheduleBlockEditInput,
  ) => void;
  timezone?: string;
};

const timeValue = (value: string, timezone?: string) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    ...(timezone ? { timeZone: timezone } : {}),
  }).format(new Date(value));
const validTime = (value: string) =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export function ScheduleDraftBlocks({ busy, draft, onEdit, timezone }: Props) {
  const [editingId, setEditingId] = useState<string>();
  const [form, setForm] = useState<EditForm>();

  const begin = (block: ScheduleBlock) => {
    setEditingId(block._id);
    setForm({
      endTime: timeValue(block.end, timezone),
      startTime: timeValue(block.start, timezone),
      title: block.title,
    });
  };
  const save = (blockId: string) => {
    if (!form) return;
    onEdit(draft._id, blockId, {
      ...form,
      expectedUpdatedAt: draft.updatedAt,
    });
    setEditingId(undefined);
    setForm(undefined);
  };
  const valid = Boolean(
    form &&
    form.title.trim() &&
    validTime(form.startTime) &&
    validTime(form.endTime) &&
    form.startTime < form.endTime,
  );

  return (
    <ThemedView style={styles.list}>
      {draft.blocks.map((block) => (
        <ThemedView key={block._id} style={styles.block}>
          {editingId === block._id && form ? (
            <>
              <PlanningTextInput
                onChangeText={(title) => setForm({ ...form, title })}
                value={form.title}
              />
              <ThemedView style={styles.timeRow}>
                <TimeInput
                  onChange={(startTime) => setForm({ ...form, startTime })}
                  value={form.startTime}
                />
                <ThemedText type="small">to</ThemedText>
                <TimeInput
                  onChange={(endTime) => setForm({ ...form, endTime })}
                  value={form.endTime}
                />
              </ThemedView>
              <ThemedView style={styles.actions}>
                <Button disabled={busy || !valid} label="Save" onPress={() => save(block._id)} />
                <Button disabled={busy} label="Cancel" onPress={() => setEditingId(undefined)} />
              </ThemedView>
            </>
          ) : (
            <BlockReadView block={block} timezone={timezone} />
          )}
          {draft.status === 'draft' &&
            block.source === 'ai' &&
            ['task', 'break'].includes(block.type) &&
            timezone &&
            editingId !== block._id && (
              <Button disabled={busy || Boolean(editingId)} label="Edit" onPress={() => begin(block)} />
            )}
        </ThemedView>
      ))}
    </ThemedView>
  );
}

function BlockReadView({
  block,
  timezone,
}: {
  block: ScheduleBlock;
  timezone?: string;
}) {
  return (
    <>
      <ThemedText type="smallBold">{block.title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {timeValue(block.start, timezone)}-{timeValue(block.end, timezone)} - {block.type}
      </ThemedText>
      {block.reason && <ThemedText type="small">{block.reason}</ThemedText>}
    </>
  );
}

function TimeInput({ onChange, value }: { onChange: (value: string) => void; value: string }) {
  return (
    <PlanningTextInput
      maxLength={5}
      onChangeText={onChange}
      placeholder="HH:mm"
      style={styles.time}
      value={value}
    />
  );
}

function Button({ disabled, label, onPress }: { disabled: boolean; label: string; onPress: () => void }) {
  return <PlanningButton disabled={disabled} label={label} onPress={onPress} />;
}

const styles = StyleSheet.create({
  actions: { backgroundColor: 'transparent', flexDirection: 'row', gap: Spacing.two },
  block: { backgroundColor: 'transparent', gap: Spacing.one },
  list: { backgroundColor: 'transparent', gap: Spacing.two },
  time: { width: 72 },
  timeRow: { alignItems: 'center', backgroundColor: 'transparent', flexDirection: 'row', gap: Spacing.two },
});
