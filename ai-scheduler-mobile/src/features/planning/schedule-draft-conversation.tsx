import { useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ScheduleChatMessage } from './schedule-chat-message';
import { ScheduleDraftComposer } from './schedule-draft-composer';
import { useScheduleDraftComposerStore } from './schedule-draft-composer-state';
import {
  canGenerateScheduleDraft,
  scheduleDraftRecoveryAction,
} from './schedule-draft-state';
import {
  ScheduleDraftPanelView,
  type ScheduleDraftPanelViewProps,
} from './schedule-draft-panel-view';

export function ScheduleDraftConversation(props: ScheduleDraftPanelViewProps) {
  const scrollRef = useRef<ScrollView>(null);
  const submitted = useScheduleDraftComposerStore(
    (state) => state.submittedInstructions[props.date],
  );
  const recovery = scheduleDraftRecoveryAction(
    props.draft,
    props.noDraft,
    props.errorCode,
  );
  const composerEnabled =
    canGenerateScheduleDraft(props.draft, props.noDraft) &&
    recovery?.kind !== 'reconnect-google';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.messages}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
      >
        <ScheduleChatMessage label="Schedule AI" role="assistant">
          오늘 일정에 원하는 조건을 편하게 말해 주세요. 등록된 작업과 보호 시간,
          캘린더 충돌을 확인해 실행 가능한 초안을 제안할게요.
        </ScheduleChatMessage>
        {submitted && (
          <ScheduleChatMessage label="나" role="user">
            {submitted}
          </ScheduleChatMessage>
        )}
        <ScheduleChatMessage label="Schedule AI" role="assistant">
          <ScheduleDraftPanelView {...props} hideGenerateRecovery />
        </ScheduleChatMessage>
      </ScrollView>
      <View className="border-border bg-background border-t" style={styles.composer}>
        <ScheduleDraftComposer
          busy={props.busy}
          date={props.date}
          disabled={!composerEnabled}
          onGenerate={props.onGenerate}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  composer: { paddingHorizontal: 4, paddingTop: 10 },
  container: { flex: 1 },
  messages: { flexGrow: 1, gap: 12, paddingBottom: 20, paddingTop: 12 },
});
