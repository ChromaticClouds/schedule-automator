import { scheduleSettingsFixtures } from '@/features/settings/schedule-settings-fixtures';
import { dailyReviewFixtures } from './daily-review-fixtures';
import { goalBreakdownFixtures } from './goal-breakdown-fixtures';
import { planningCreateFixtures } from './planning-create-fixtures';
import {
  planningSectionEmptyMessages,
  planningSectionErrorMessages,
} from './planning-empty-state';
import { scheduleDraftPanelFixtures } from './schedule-draft-fixtures';
import { taskSummaryFixtures } from './task-summary-fixtures';
import { weeklyRescheduleFixtures } from './weekly-reschedule-fixtures';

type CatalogGroup =
  | 'dailyReview'
  | 'goalBreakdown'
  | 'planningCreate'
  | 'planningSections'
  | 'scheduleDraft'
  | 'scheduleSettings'
  | 'taskSummary'
  | 'weeklyReschedule';

export type PlanningStateCatalogEntry<TProps = unknown> = {
  description: string;
  group: CatalogGroup;
  name: string;
  props: TProps;
};

const entry = <TProps>(
  group: CatalogGroup,
  name: string,
  description: string,
  props: TProps,
): PlanningStateCatalogEntry<TProps> => ({
  description,
  group,
  name,
  props,
});

export const planningStateCatalog = {
  dailyReview: [
    entry('dailyReview', 'loading', 'Daily review loading state.', dailyReviewFixtures.loading),
    entry('dailyReview', 'empty', 'No scheduled tasks to review.', dailyReviewFixtures.empty),
    entry('dailyReview', 'tasks', 'Tasks can be marked done or missed.', dailyReviewFixtures.tasks),
    entry('dailyReview', 'saveError', 'Daily review save failure.', dailyReviewFixtures.saveError),
    entry('dailyReview', 'saved', 'Daily review saved success.', dailyReviewFixtures.saved),
  ],
  goalBreakdown: [
    entry('goalBreakdown', 'success', 'Generated tasks are ready.', goalBreakdownFixtures.success),
    entry('goalBreakdown', 'replay', 'Idempotent replay result.', goalBreakdownFixtures.replay),
    entry('goalBreakdown', 'providerError', 'AI provider failure copy.', goalBreakdownFixtures.providerError),
  ],
  planningCreate: [
    entry('planningCreate', 'idle', 'Create row idle state.', planningCreateFixtures.idle),
    entry('planningCreate', 'emptyGuidance', 'Create row empty input guidance.', planningCreateFixtures.emptyGuidance),
    entry('planningCreate', 'pending', 'Create row pending state.', planningCreateFixtures.pending),
    entry('planningCreate', 'error', 'Create row mutation error.', planningCreateFixtures.error),
  ],
  planningSections: [
    entry('planningSections', 'goalsEmpty', 'Goals empty state copy.', planningSectionEmptyMessages.목표),
    entry('planningSections', 'tasksEmpty', 'Tasks empty state copy.', planningSectionEmptyMessages.작업),
    entry('planningSections', 'protectedTimeEmpty', 'Protected time empty state copy.', planningSectionEmptyMessages['보호 시간']),
    entry('planningSections', 'tasksError', 'Tasks error state copy.', planningSectionErrorMessages.작업),
  ],
  scheduleDraft: [
    entry('scheduleDraft', 'empty', 'No draft exists yet.', scheduleDraftPanelFixtures.empty),
    entry('scheduleDraft', 'draft', 'Draft review with actions.', scheduleDraftPanelFixtures.draft),
    entry('scheduleDraft', 'approved', 'Approved draft waiting for sync.', scheduleDraftPanelFixtures.approved),
    entry('scheduleDraft', 'synced', 'Calendar sync completed.', scheduleDraftPanelFixtures.synced),
    entry('scheduleDraft', 'googleReconnectError', 'Reconnect recovery state.', scheduleDraftPanelFixtures.googleReconnectError),
    entry('scheduleDraft', 'staleContextError', 'Fresh draft recovery state.', scheduleDraftPanelFixtures.staleContextError),
  ],
  scheduleSettings: [
    entry('scheduleSettings', 'valid', 'Valid schedule preferences.', scheduleSettingsFixtures.valid),
    entry('scheduleSettings', 'invalidTime', 'Invalid wake time form.', scheduleSettingsFixtures.invalidTime),
    entry('scheduleSettings', 'error', 'Settings save error copy.', scheduleSettingsFixtures.errorMessage),
  ],
  taskSummary: [
    entry('taskSummary', 'loading', 'Task summary loading state.', taskSummaryFixtures.loading),
    entry('taskSummary', 'empty', 'Task summary empty state.', taskSummaryFixtures.empty),
    entry('taskSummary', 'populated', 'Task summary with grouped statuses.', taskSummaryFixtures.populated),
    entry('taskSummary', 'error', 'Task summary error state.', taskSummaryFixtures.error),
  ],
  weeklyReschedule: [
    entry('weeklyReschedule', 'empty', 'No missed tasks are ready.', weeklyRescheduleFixtures.empty),
    entry('weeklyReschedule', 'pending', 'Weekly replan in progress.', weeklyRescheduleFixtures.pending),
    entry('weeklyReschedule', 'placed', 'Missed task placed into a draft.', weeklyRescheduleFixtures.placed),
    entry('weeklyReschedule', 'overflow', 'Missed task could not be placed.', weeklyRescheduleFixtures.overflow),
    entry('weeklyReschedule', 'replayed', 'Idempotent replay result.', weeklyRescheduleFixtures.replayed),
    entry('weeklyReschedule', 'schemaError', 'Invalid provider output copy.', weeklyRescheduleFixtures.schemaError),
    entry('weeklyReschedule', 'saveError', 'Persistence failure copy.', weeklyRescheduleFixtures.saveError),
  ],
} as const;

export const planningStateCatalogGroups = Object.keys(
  planningStateCatalog,
) as (keyof typeof planningStateCatalog)[];
