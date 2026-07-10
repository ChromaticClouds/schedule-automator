import { Keyboard, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useScheduleDraftComposerStore } from './schedule-draft-composer-state';

type Props = {
  busy: boolean;
  date: string;
  disabled?: boolean;
  onGenerate: (instruction?: string) => void;
};

const maxInstructionLength = 500;

export function ScheduleDraftComposer({ busy, date, disabled, onGenerate }: Props) {
  const instruction = useScheduleDraftComposerStore(
    (state) => state.instructions[date] ?? '',
  );
  const setInstruction = useScheduleDraftComposerStore(
    (state) => state.setInstruction,
  );
  const submitInstruction = useScheduleDraftComposerStore(
    (state) => state.submitInstruction,
  );
  const message = instruction.trim();

  const send = () => {
    if (!message || busy || disabled) return;
    Keyboard.dismiss();
    submitInstruction(date, message);
    onGenerate(message);
  };

  return (
    <View className="gap-1">
      <View className="border-border bg-card flex-row items-end gap-2 rounded-3xl border p-2">
        <Textarea
          accessibilityLabel="AI 일정 요청"
          className="max-h-32 min-h-11 flex-1 border-0 bg-transparent px-3 py-2 shadow-none"
          editable={!busy && !disabled}
          maxLength={maxInstructionLength}
          onChangeText={(value) => setInstruction(date, value)}
          placeholder={
            disabled
              ? '현재 초안을 승인하거나 거절한 뒤 새 요청을 보낼 수 있어요'
              : '오늘 일정에 원하는 조건을 입력하세요'
          }
          value={instruction}
        />
        <Button
          accessibilityLabel="AI 일정 요청 보내기"
          className="h-11 rounded-full px-4"
          disabled={busy || disabled || !message}
          onPress={send}
          size="lg"
        >
          <Text variant="small">{busy ? '생성 중' : '전송'}</Text>
        </Button>
      </View>
      {instruction.length >= 450 && (
        <Text className="px-3 text-right text-muted-foreground text-xs">
          {instruction.length}/{maxInstructionLength}
        </Text>
      )}
    </View>
  );
}
