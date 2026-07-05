import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const readSource = (path) => readFileSync(join(root, 'src', path), 'utf8');
const createRow = readSource('features/planning/planning-create-row.tsx');
const createSections = readSource('features/planning/planning-create-sections.tsx');
const goalSection = readSource('features/planning/planning-goal-create-section.tsx');
const taskSection = readSource('features/planning/planning-task-section.tsx');
const taskCreateRow = readSource('features/planning/planning-task-create-row.tsx');
const protectedSection = readSource('features/planning/planning-protected-create-section.tsx');
const protectedRow = readSource('features/planning/protected-time-create-row.tsx');
const taskItem = readSource('features/planning/task-manage-item.tsx');

for (const text of [
  'PlanningFlowGuide',
  'PlanningGoalCreateSection',
  'PlanningTaskSection',
  'PlanningProtectedCreateSection',
]) {
  assert.match(createSections, new RegExp(text));
}

assert.match(goalSection, /주간 목표를 입력하세요/);
assert.match(taskCreateRow, /작업명과 시간을 분리/);
assert.match(taskCreateRow, /60분/);
assert.match(taskSection, /useUpdateTask/);
assert.match(taskSection, /useDeleteTask/);
assert.match(taskItem, /label="수정"/);
assert.match(taskItem, /삭제 중/);
assert.match(protectedSection, /setStart/);
assert.match(protectedSection, /setEnd/);
assert.match(protectedRow, /보호 시간 이름/);
assert.match(protectedRow, /12:00–13:00/);
assert.match(protectedRow, /validProtectedTimeRange/);
assert.doesNotMatch(protectedSection, /startTime: '22:00'/);
assert.doesNotMatch(protectedSection, /endTime: '23:00'/);
assert.match(createRow, /editable={!isPending}/);
assert.match(createRow, /disabled={isPending}/);
assert.match(createRow, /저장 중/);
assert.match(createRow, /showEmptyMessage/);

console.log('planning create flow validation passed');
