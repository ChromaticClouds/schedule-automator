import { scheduleSettingsFixtures } from '@/features/settings/schedule-settings-fixtures';
import { goalBreakdownFixtures } from './goal-breakdown-fixtures';
import {
  planningSectionEmptyMessages,
  planningSectionErrorMessages,
} from './planning-empty-state';
import { scheduleDraftPanelFixtures } from './schedule-draft-fixtures';
import { weeklyRescheduleFixtures } from './weekly-reschedule-fixtures';

type CatalogGroup =
  | 'goalBreakdown'
  | 'planningSections'
  | 'scheduleDraft'
  | 'scheduleSettings'
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
  goalBreakdown: [
    entry('goalBreakdown', 'success', 'Generated tasks are ready.', goalBreakdownFixtures.success),
    entry('goalBreakdown', 'replay', 'Idempotent replay result.', goalBreakdownFixtures.replay),
    entry('goalBreakdown', 'providerError', 'AI provider failure copy.', goalBreakdownFixtures.providerError),
  ],
  planningSections: [
    entry('planningSections', 'goalsEmpty', 'Goals empty state copy.', planningSectionEmptyMessages.Goals),
    entry('planningSections', 'tasksEmpty', 'Tasks empty state copy.', planningSectionEmptyMessages.Tasks),
    entry('planningSections', 'protectedTimeEmpty', 'Protected time empty state copy.', planningSectionEmptyMessages['Protected time']),
    entry('planningSections', 'tasksError', 'Tasks error state copy.', planningSectionErrorMessages.Tasks),
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
