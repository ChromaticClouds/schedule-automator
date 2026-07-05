import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { PlanningButton } from './planning-controls';
import type { ScheduleDraftRecoveryAction } from './schedule-draft-state';
import type { ScheduleDraft } from './types';

type RecoveryActionButtonProps = {
  action: ScheduleDraftRecoveryAction;
  busy: boolean;
  draft?: ScheduleDraft;
  onApprove: (id: string) => void;
  onGenerate: () => void;
  onReconnect: () => void;
  onRegenerate: (id: string) => void;
};

export function ScheduleDraftRecoveryActionButton({
  action,
  busy,
  draft,
  onApprove,
  onGenerate,
  onReconnect,
  onRegenerate,
}: RecoveryActionButtonProps) {
  const run = () => {
    if (action.kind === 'generate') return onGenerate();
    if (action.kind === 'reconnect-google') return onReconnect();
    if (!draft) return undefined;
    if (action.kind === 'retry-sync') return onApprove(draft._id);
    return onRegenerate(draft._id);
  };
  return (
    <ThemedView style={styles.recovery}>
      {action.message && <ThemedText type="small">{action.message}</ThemedText>}
      <PlanningButton
        disabled={busy}
        label={busy ? '처리 중...' : action.label}
        onPress={run}
        style={styles.button}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  recovery: { backgroundColor: 'transparent', gap: Spacing.one },
});
