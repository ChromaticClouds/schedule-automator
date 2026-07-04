import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const readSource = (path) => readFileSync(join(root, 'src', path), 'utf8');
const appTabs = readSource('components/app-tabs.tsx');
const previewRoute = readSource('app/planning-preview.tsx');
const preview = readSource('features/planning/planning-state-preview.tsx');

assert.match(previewRoute, /PlanningStatePreview/);
assert.match(previewRoute, /__DEV__ \|\| ENV\.ENABLE_DEV_TOOLS/);
assert.equal(appTabs.includes('planning-preview'), false);

for (const token of [
  'planningStateCatalogGroups',
  'planningStateCatalog.scheduleDraft',
  'planningStateCatalog.weeklyReschedule',
  'planningStateCatalog.goalBreakdown',
  'planningStateCatalog.planningSections',
  'ScheduleDraftPanelView',
  'WeeklyRescheduleView',
  'GoalBreakdownView',
]) {
  assert.match(preview, new RegExp(token.replaceAll('.', '\\.')));
}

assert.equal(preview.includes('storybook'), false);

console.log('planning state preview validation passed');
