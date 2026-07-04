import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  goalBreakdownErrorFeedback,
  goalBreakdownSuccessFeedback,
} from './goal-breakdown-state';
import { GoalBreakdownView } from './goal-breakdown-view';
import {
  planningStateCatalog,
  planningStateCatalogGroups,
} from './planning-state-catalog';
import { ScheduleDraftPanelView, type ScheduleDraftPanelViewProps } from './schedule-draft-panel-view';
import type { Goal, GoalBreakdownResult } from './types';
import { WeeklyRescheduleView, type WeeklyRescheduleViewProps } from './weekly-reschedule-view';

const noop = () => undefined;
const sampleGoals: Goal[] = [{
  _id: 'goal-preview',
  importance: 4,
  status: 'active',
  title: 'Ship a calm weekly planning flow',
}];

export function PlanningStatePreview() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">Planning state preview</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Dev-only catalog previews for manual state verification.
        </ThemedText>
      </ThemedView>
      <CatalogIndex />
      <PreviewGroup title="Schedule draft">
        {planningStateCatalog.scheduleDraft.map((entry) => (
          <PreviewCard key={entry.name} entry={entry.name}>
            <ScheduleDraftPanelView
              {...(entry.props as ScheduleDraftPanelViewProps)}
              onApprove={noop}
              onEdit={noop}
              onGenerate={noop}
              onReconnect={noop}
              onRegenerate={noop}
              onReject={noop}
            />
          </PreviewCard>
        ))}
      </PreviewGroup>
      <PreviewGroup title="Weekly reschedule">
        {planningStateCatalog.weeklyReschedule.map((entry) => (
          <PreviewCard key={entry.name} entry={entry.name}>
            <WeeklyRescheduleView
              {...(entry.props as Omit<WeeklyRescheduleViewProps, 'onRun'>)}
              onRun={noop}
            />
          </PreviewCard>
        ))}
      </PreviewGroup>
      <PreviewGroup title="Goal breakdown">
        {planningStateCatalog.goalBreakdown.map((entry) => (
          <PreviewCard key={entry.name} entry={entry.name}>
            <GoalBreakdownView
              feedback={goalBreakdownFeedback(entry.props)}
              goals={sampleGoals}
              isLoading={false}
              onGenerate={noop}
            />
          </PreviewCard>
        ))}
      </PreviewGroup>
      <PreviewGroup title="Planning section copy">
        {planningStateCatalog.planningSections.map((entry) => (
          <CopyCard key={entry.name} label={entry.name} value={String(entry.props)} />
        ))}
      </PreviewGroup>
    </ScrollView>
  );
}

function CatalogIndex() {
  return (
    <ThemedView type="backgroundElement" style={styles.section}>
      <ThemedText type="smallBold">Catalog groups</ThemedText>
      {planningStateCatalogGroups.map((group) => (
        <ThemedText key={group} type="small" themeColor="textSecondary">
          {group}: {planningStateCatalog[group].map((entry) => entry.name).join(', ')}
        </ThemedText>
      ))}
    </ThemedView>
  );
}

function PreviewGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <ThemedView style={styles.group}>
      <ThemedText type="smallBold">{title}</ThemedText>
      {children}
    </ThemedView>
  );
}

function PreviewCard({ children, entry }: { children: ReactNode; entry: string }) {
  return (
    <ThemedView style={styles.card}>
      <ThemedText type="smallBold">{entry}</ThemedText>
      {children}
    </ThemedView>
  );
}

function CopyCard({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.section}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">{value}</ThemedText>
    </ThemedView>
  );
}

function goalBreakdownFeedback(value: unknown) {
  const result = value as Partial<GoalBreakdownResult>;
  if (typeof result.replayed === 'boolean' && Array.isArray(result.tasks)) {
    return goalBreakdownSuccessFeedback(result as GoalBreakdownResult);
  }
  return goalBreakdownErrorFeedback(value);
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'transparent', gap: Spacing.two },
  content: { gap: Spacing.three, paddingTop: Spacing.three },
  group: { backgroundColor: 'transparent', gap: Spacing.two },
  header: { gap: Spacing.one },
  section: { borderRadius: Spacing.two, gap: Spacing.one, padding: Spacing.three },
});
