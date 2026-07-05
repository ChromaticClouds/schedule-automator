import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const readSource = (path) => readFileSync(join(root, 'src', path), 'utf8');

const tabs = readSource('components/app-tabs.tsx');
const webTabs = readSource('components/app-tabs.web.tsx');
const dashboard = readSource('features/planning/planning-dashboard.tsx');
const home = readSource('app/(tabs)/index.tsx');
const explore = readSource('app/(tabs)/explore.tsx');
const settings = readSource('app/(tabs)/settings.tsx');
const settingsView = readSource('features/settings/schedule-settings-view.tsx');
const protectedRow = readSource('features/planning/protected-time-create-row.tsx');
const controls = readSource('features/planning/planning-controls.tsx');

for (const label of ['홈', '탐색', '설정']) {
  assert.match(tabs, new RegExp(label));
  assert.match(webTabs, new RegExp(label));
}

for (const text of ['탐색', '활용 흐름', '목표에서 실행 일정까지']) {
  assert.match(explore, new RegExp(text));
}

for (const text of ['설정', '기상 시간', '시간대', '설정 저장']) {
  assert.match(`${settings}\n${settingsView}`, new RegExp(text));
}

assert.match(tabs, /default: colors\.textSecondary/);
assert.match(tabs, /selected: colors\.primary/);
assert.match(settings, /KeyboardAvoidingView/);
assert.match(settingsView, /PlanningTextInput/);
assert.match(settingsView, /PlanningButton/);
assert.match(settingsView, /accessibilityLiveRegion="polite"/);
assert.match(protectedRow, /validProtectedTimeRange/);
assert.match(protectedRow, /12:00–13:00/);
assert.match(controls, /accessibilityRole="button"/);
assert.match(controls, /selectedButtonText: theme\.text/);

for (const source of [home, explore, settings]) {
  assert.match(source, /edges={\['top', 'left', 'right'\]}/);
}
for (const source of [dashboard, home, explore, settings]) {
  assert.doesNotMatch(source, /BottomTabInset/);
}
assert.doesNotMatch(dashboard, /automaticallyAdjustKeyboardInsets/);

console.log('navigation UI validation passed');
