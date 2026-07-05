import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const read = (path) => readFileSync(join(root, path), 'utf8');
const readRepo = (path) => readFileSync(join(root, '..', path), 'utf8');
const packageJson = JSON.parse(read('package.json'));
const config = read('playwright.config.ts');
const spec = read('tests/visual/planning-storybook.spec.ts');
const stories = read('src/features/planning/planning-state-preview.stories.tsx');
const workflow = readRepo('.github/workflows/mobile-visual.yml');
const guide = readRepo('docs/mobile-storybook-visual-testing.md');

assert.match(packageJson.devDependencies['@playwright/test'], /^\^1\./);
for (const script of ['visual:capture', 'visual:test', 'visual:update']) {
  assert.equal(typeof packageJson.scripts[script], 'string');
}
assert.match(config, /snapshotPathTemplate/);
assert.match(config, /pnpm storybook:web/);
assert.match(spec, /VISUAL_MODE === 'capture'/);
assert.match(spec, /toHaveScreenshot/);
assert.match(spec, /testInfo\.outputPath/);
for (const story of [
  'DailyReview',
  'TaskSummary',
  'PlanningCreate',
  'ScheduleDraft',
  'WeeklyReschedule',
  'GoalBreakdown',
  'PlanningCopy',
]) {
  assert.match(stories, new RegExp(`export const ${story}`));
}
assert.match(workflow, /workflow_dispatch/);
assert.match(workflow, /playwright install --with-deps chromium/);
assert.match(workflow, /pnpm visual:capture/);
assert.match(workflow, /actions\/upload-artifact/);
assert.match(guide, /pnpm visual:capture/);
assert.match(guide, /pnpm visual:update/);

console.log('visual screenshot validation passed');
