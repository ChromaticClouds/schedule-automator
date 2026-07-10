import { Keyboard, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useScheduleDraftComposerStore } from './schedule-draft-composer-state';

type Props = {
  busy: boolean;
  date: string;
  onGenerate: (instruction?: string) => void;
};

const maxInstructionLength = 500;

export function ScheduleDraftComposer({ busy, date, onGenerate }: Props) {
  const instruction = useScheduleDraftComposerStore(
    (state) => state.instructions[date] ?? '',
  );
  const setInstruction = useScheduleDraftComposerStore(
    (state) => state.setInstruction,
  );
  const message = instruction.trim();

  const send = () => {
    if (!message || busy) return;
    Keyboard.dismiss();
    onGenerate(message);
  };

  return (
    <View className="gap-3 rounded-lg border border-border bg-muted/40 p-3">
      <View className="gap-1">
        <Text variant="small">AI에게 일정 조건 전달</Text>
        <Text className="text-muted-foreground text-xs">
          예: 오전에는 집중 작업만 하고, 회의 전후로 15분의 여유를 남겨주세요.
        </Text>
      </View>
      <Textarea
        accessibilityLabel="AI 일정 요청"
        editable={!busy}
        maxLength={maxInstructionLength}
        onChangeText={(value) => setInstruction(date, value)}
        placeholder="오늘 일정에 반영할 조건을 입력하세요"
        value={instruction}
      />
      <View className="flex-row items-center gap-3">
        <Text className="flex-1 text-muted-foreground text-xs">
          {instruction.length}/{maxInstructionLength}
        </Text>
        <Button
          accessibilityLabel="AI 일정 요청 보내기"
          disabled={busy || !message}
          onPress={send}
          size="lg"
        >
          <Text variant="small">{busy ? '생성 중...' : '보내기'}</Text>
        </Button>
      </View>
    </View>
  );
}
