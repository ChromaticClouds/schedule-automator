import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const readSource = (path) => readFileSync(join(root, 'src', path), 'utf8');
const createRow = readSource('features/planning/planning-create-row.tsx');
const createSections = readSource('features/planning/planning-create-sections.tsx');

for (const text of [
  '주간 목표를 입력하세요',
  '작업을 입력하세요',
  '보호 시간을 입력하세요',
  '추가할 목표 제목',
  '추가할 작업 제목',
  '보호 시간 이름',
]) {
  assert.match(createSections, new RegExp(text));
}

assert.match(createRow, /editable={!isPending}/);
assert.match(createRow, /disabled={isPending}/);
assert.match(createRow, /저장 중/);
assert.match(createRow, /showEmptyMessage/);

for (const setter of ['setGoalTitle', 'setTaskTitle', 'setProtectedTitle']) {
  assert.match(createSections, new RegExp(`onSuccess: \\(\\) => ${setter}\\(''\\)`));
}

console.log('planning create flow validation passed');
