import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const readSource = (path) => readFileSync(join(root, 'src', path), 'utf8');
const createRow = readSource('features/planning/planning-create-row.tsx');
const createSections = readSource('features/planning/planning-create-sections.tsx');

for (const text of [
  'Add a weekly goal',
  'Add a task',
  'Add protected time',
  'Enter a goal title',
  'Enter a task title',
  'Enter a protected-time title',
]) {
  assert.match(createSections, new RegExp(text));
}

assert.match(createRow, /editable={!isPending}/);
assert.match(createRow, /disabled={isPending}/);
assert.match(createRow, /Saving\.\.\./);
assert.match(createRow, /showEmptyMessage/);

for (const setter of ['setGoalTitle', 'setTaskTitle', 'setProtectedTitle']) {
  assert.match(createSections, new RegExp(`onSuccess: \\(\\) => ${setter}\\(''\\)`));
}

console.log('planning create flow validation passed');
