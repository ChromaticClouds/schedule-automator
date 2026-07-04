import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const readSource = (path) => readFileSync(join(root, 'src', path), 'utf8');
const appTabs = readSource('components/app-tabs.tsx');
const previewRoute = readSource('app/planning-preview.tsx');
const preview = readSource('features/planning/planning-state-preview.tsx');
const previewLayout = readSource('features/planning/planning-state-preview-layout.tsx');
const previewSections = readSource('features/planning/planning-state-preview-sections.tsx');

assert.match(previewRoute, /PlanningStatePreview/);
assert.match(previewRoute, /__DEV__ \|\| ENV\.ENABLE_DEV_TOOLS/);
assert.equal(appTabs.includes('planning-preview'), false);

for (const token of [
  'PlanningStatePreviewSections',
  'CatalogIndex',
]) {
  assert.match(preview, new RegExp(token));
}

for (const token of [
  'planningStateCatalogGroups',
  'planningStateCatalog[group]',
]) {
  assert.match(previewLayout, new RegExp(token.replaceAll('[', '\\[').replaceAll(']', '\\]')));
}

for (const token of [
  'planningStateCatalog.dailyReview',
  'planningStateCatalog.taskSummary',
  'planningStateCatalog.planningCreate',
  'planningStateCatalog.scheduleDraft',
  'planningStateCatalog.weeklyReschedule',
  'planningStateCatalog.goalBreakdown',
  'planningStateCatalog.planningSections',
  'DailyReviewView',
  'TaskSummaryView',
  'PlanningCreateRow',
  'ScheduleDraftPanelView',
  'WeeklyRescheduleView',
  'GoalBreakdownView',
]) {
  assert.match(previewSections, new RegExp(token.replaceAll('.', '\\.')));
}

assert.equal(preview.includes('storybook'), false);

console.log('planning state preview validation passed');
