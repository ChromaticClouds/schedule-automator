import { goalBreakdownErrorFeedback, goalBreakdownSuccessFeedback } from './goal-breakdown-state';
import { GoalBreakdownView } from './goal-breakdown-view';
import { DailyReviewView, type DailyReviewViewProps } from './daily-review-view';
import { PlanningCreateRow } from './planning-create-row';
import type { PlanningCreateRowProps } from './planning-create-row';
import { CopyCard, PreviewCard, PreviewGroup } from './planning-state-preview-layout';
import { planningStateCatalog } from './planning-state-catalog';
import { ScheduleDraftPanelView, type ScheduleDraftPanelViewProps } from './schedule-draft-panel-view';
import { TaskSummaryView, type TaskSummaryViewProps } from './task-summary-view';
import type { Goal, GoalBreakdownResult } from './types';
import { WeeklyRescheduleView, type WeeklyRescheduleViewProps } from './weekly-reschedule-view';

const noop = () => undefined;
const sampleGoals: Goal[] = [{
  _id: 'goal-preview',
  importance: 4,
  status: 'active',
  title: 'Ship a calm weekly planning flow',
}];

export function PlanningStatePreviewSections() {
  return (
    <>
      <DailyReviewPreview />
      <TaskSummaryPreview />
      <PlanningCreatePreview />
      <ScheduleDraftPreview />
      <WeeklyReschedulePreview />
      <GoalBreakdownPreview />
      <PlanningSectionCopyPreview />
    </>
  );
}

function DailyReviewPreview() {
  return (
    <PreviewGroup title="Daily review">
      {planningStateCatalog.dailyReview.map((entry) => (
        <PreviewCard key={entry.name} entry={entry.name}>
          <DailyReviewView
            {...(entry.props as Omit<DailyReviewViewProps, 'onNotesChange' | 'onSave' | 'onSelect'>)}
            onNotesChange={noop}
            onSave={noop}
            onSelect={noop}
          />
        </PreviewCard>
      ))}
    </PreviewGroup>
  );
}

function TaskSummaryPreview() {
  return (
    <PreviewGroup title="Task summary">
      {planningStateCatalog.taskSummary.map((entry) => (
        <PreviewCard key={entry.name} entry={entry.name}>
          <TaskSummaryView {...(entry.props as TaskSummaryViewProps)} />
        </PreviewCard>
      ))}
    </PreviewGroup>
  );
}

function PlanningCreatePreview() {
  return (
    <PreviewGroup title="Planning create row">
      {planningStateCatalog.planningCreate.map((entry) => (
        <PreviewCard key={entry.name} entry={entry.name}>
          <PlanningCreateRow {...(entry.props as PlanningCreateRowProps)} />
        </PreviewCard>
      ))}
    </PreviewGroup>
  );
}

function ScheduleDraftPreview() {
  return (
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
  );
}

function WeeklyReschedulePreview() {
  return (
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
  );
}

function GoalBreakdownPreview() {
  return (
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
  );
}

function PlanningSectionCopyPreview() {
  return (
    <PreviewGroup title="Planning section copy">
      {planningStateCatalog.planningSections.map((entry) => (
        <CopyCard key={entry.name} label={entry.name} value={String(entry.props)} />
      ))}
    </PreviewGroup>
  );
}

function goalBreakdownFeedback(value: unknown) {
  const result = value as Partial<GoalBreakdownResult>;
  if (typeof result.replayed === 'boolean' && Array.isArray(result.tasks)) {
    return goalBreakdownSuccessFeedback(result as GoalBreakdownResult);
  }
  return goalBreakdownErrorFeedback(value);
}
