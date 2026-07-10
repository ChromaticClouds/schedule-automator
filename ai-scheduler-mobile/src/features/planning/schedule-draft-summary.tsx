import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { ScheduleDraftBlocks } from './schedule-draft-blocks';
import {
  scheduleDraftCalendarEventSummary,
  scheduleDraftStatusMessage,
} from './schedule-draft-state';
import type { ScheduleDraftPanelViewProps } from './schedule-draft-panel-view';
import type { ScheduleDraft } from './types';

const draftStatusLabels: Record<ScheduleDraft['status'], string> = {
  approved: '승인됨',
  draft: '초안',
  expired: '만료됨',
  rejected: '거절됨',
  synced: '동기화됨',
};

type Props = {
  busy: boolean;
  draft: ScheduleDraft;
  onEdit: ScheduleDraftPanelViewProps['onEdit'];
  timezone?: string;
};

export function ScheduleDraftSummary({ busy, draft, onEdit, timezone }: Props) {
  const statusMessage = scheduleDraftStatusMessage(draft);
  const calendarSummary = scheduleDraftCalendarEventSummary(draft);

  return (
    <View className="gap-3">
      <Badge
        className="self-start"
        variant={draft.status === 'rejected' ? 'destructive' : 'secondary'}
      >
        <Text variant="small">AI 일정 제안</Text>
      </Badge>
      <ThemedText type="small" themeColor="textSecondary">
        {draftStatusLabels[draft.status]} - {draft.summary ?? '요약 없음'}
      </ThemedText>
      {statusMessage && <ThemedText type="small">{statusMessage}</ThemedText>}
      {calendarSummary && (
        <ThemedText type="small" themeColor="textSecondary">
          {calendarSummary}
        </ThemedText>
      )}
      {draft.warnings.map((warning) => (
        <ThemedText key={warning} type="small" themeColor="danger">
          주의: {warning}
        </ThemedText>
      ))}
      <ScheduleDraftBlocks busy={busy} draft={draft} onEdit={onEdit} timezone={timezone} />
    </View>
  );
}
