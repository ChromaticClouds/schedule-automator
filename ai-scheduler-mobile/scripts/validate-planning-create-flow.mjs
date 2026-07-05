import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const readSource = (path) => readFileSync(join(root, 'src', path), 'utf8');
const createRow = readSource('features/planning/planning-create-row.tsx');
const createSections = readSource('features/planning/planning-create-sections.tsx');
const protectedRow = readSource('features/planning/protected-time-create-row.tsx');

for (const text of [
  '주간 목표를 입력하세요',
  '작업을 입력하세요',
  '추가할 목표 제목',
  '추가할 작업 제목',
  'protectedStart',
  'protectedEnd',
]) {
  assert.match(createSections, new RegExp(text));
}

assert.match(protectedRow, /보호 시간 이름/);
assert.match(protectedRow, /12:00–13:00/);
assert.match(protectedRow, /validProtectedTimeRange/);
assert.doesNotMatch(createSections, /startTime: '22:00'/);
assert.doesNotMatch(createSections, /endTime: '23:00'/);
assert.match(createRow, /editable={!isPending}/);
assert.match(createRow, /disabled={isPending}/);
assert.match(createRow, /저장 중/);
assert.match(createRow, /showEmptyMessage/);

for (const setter of ['setGoalTitle', 'setTaskTitle', 'setProtectedTitle']) {
  assert.match(createSections, new RegExp(`onSuccess: \\(\\) => ${setter}\\(''\\)`));
}

console.log('planning create flow validation passed');
