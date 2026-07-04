import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const catalogSource = readFileSync(
  join(root, 'src/features/planning/planning-state-catalog.ts'),
  'utf8',
);

const requiredGroups = [
  'dailyReview',
  'goalBreakdown',
  'planningCreate',
  'planningSections',
  'scheduleDraft',
  'scheduleSettings',
  'taskSummary',
  'weeklyReschedule',
];
const requiredStates = {
  dailyReview: ['loading', 'empty', 'tasks', 'saveError', 'saved'],
  goalBreakdown: ['success', 'replay', 'providerError'],
  planningCreate: ['idle', 'emptyGuidance', 'pending', 'error'],
  planningSections: [
    'goalsEmpty',
    'tasksEmpty',
    'protectedTimeEmpty',
    'tasksError',
  ],
  scheduleDraft: [
    'empty',
    'draft',
    'approved',
    'synced',
    'googleReconnectError',
    'staleContextError',
  ],
  scheduleSettings: ['valid', 'invalidTime', 'error'],
  taskSummary: ['loading', 'empty', 'populated', 'error'],
  weeklyReschedule: [
    'empty',
    'pending',
    'placed',
    'overflow',
    'replayed',
    'schemaError',
    'saveError',
  ],
};

for (const group of requiredGroups) {
  assert.match(catalogSource, new RegExp(`${group}: \\[`));
  for (const state of requiredStates[group]) {
    assert.match(catalogSource, new RegExp(`'${state}'`));
  }
}

assert.match(catalogSource, /PlanningStateCatalogEntry/);
assert.match(catalogSource, /description: string/);
assert.match(catalogSource, /props: TProps/);
assert.match(catalogSource, /planningSectionEmptyMessages/);
assert.match(catalogSource, /planningSectionErrorMessages/);
assert.equal(catalogSource.includes('storybook'), false);

console.log('planning state catalog validation passed');
