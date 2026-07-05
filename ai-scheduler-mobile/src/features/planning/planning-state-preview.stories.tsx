import type { Meta, StoryObj } from '@storybook/react-native';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { PlanningStatePreview } from './planning-state-preview';
import {
  DailyReviewPreview,
  GoalBreakdownPreview,
  PlanningCreatePreview,
  PlanningSectionCopyPreview,
  ScheduleDraftPreview,
  TaskSummaryPreview,
  WeeklyReschedulePreview,
} from './planning-state-preview-sections';

const meta = {
  title: 'Planning/State Preview',
  component: PlanningStatePreview,
  parameters: {
    notes:
      'Renders the fixture-backed planning state catalog used by the in-app preview route.',
  },
} satisfies Meta<typeof PlanningStatePreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Catalog: Story = {};

const renderGroup = (children: ReactNode) => (
  <ThemedView style={styles.root}>
    <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
  </ThemedView>
);

export const DailyReview: Story = {
  render: () => renderGroup(<DailyReviewPreview />),
};
export const TaskSummary: Story = {
  render: () => renderGroup(<TaskSummaryPreview />),
};
export const PlanningCreate: Story = {
  render: () => renderGroup(<PlanningCreatePreview />),
};
export const ScheduleDraft: Story = {
  render: () => renderGroup(<ScheduleDraftPreview />),
};
export const WeeklyReschedule: Story = {
  render: () => renderGroup(<WeeklyReschedulePreview />),
};
export const GoalBreakdown: Story = {
  render: () => renderGroup(<GoalBreakdownPreview />),
};
export const PlanningCopy: Story = {
  render: () => renderGroup(<PlanningSectionCopyPreview />),
};

const styles = StyleSheet.create({
  content: { padding: Spacing.three },
  root: { flex: 1 },
});
