import { strict as assert } from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const readSource = (path) => readFileSync(join(root, 'src', path), 'utf8');
const readRoot = (path) => readFileSync(join(root, path), 'utf8');

const drawer = readSource('components/app-drawer.tsx');
const tabLayout = readSource('app/(tabs)/_layout.tsx');
const tabScreen = readSource('components/tab-screen.tsx');
const dashboard = readSource('features/planning/planning-dashboard.tsx');
const home = readSource('app/(tabs)/index.tsx');
const planning = readSource('app/(tabs)/planning.tsx');
const review = readSource('app/(tabs)/review.tsx');
const explore = readSource('app/(tabs)/explore.tsx');
const settings = readSource('app/(tabs)/settings.tsx');
const settingsView = readSource('features/settings/schedule-settings-view.tsx');
const protectedRow = readSource('features/planning/protected-time-create-row.tsx');
const controls = readSource('features/planning/planning-controls.tsx');
const rootLayout = readSource('app/_layout.tsx');
const input = readSource('components/ui/input.tsx');
const textarea = readSource('components/ui/textarea.tsx');
const metro = readRoot('metro.config.js');
const globalCss = readSource('global.css');

for (const label of ['오늘 일정', '계획 관리', '오늘 회고', '기능 탐색', '설정']) {
  assert.match(drawer, new RegExp(label));
}

assert.match(drawer, /from 'expo-router\/drawer'/);
assert.match(drawer, /drawerPosition: 'left'/);
assert.match(drawer, /drawerType: 'front'/);
assert.match(drawer, /swipeEnabled: true/);
assert.match(drawer, /accessibilityLabel="카테고리 메뉴 열기"/);
assert.match(tabLayout, /<AppDrawer \/>/);
assert.equal(existsSync(join(root, 'src/components/app-tabs.tsx')), false);
assert.equal(existsSync(join(root, 'src/components/app-tabs.web.tsx')), false);

for (const text of ['탐색', '활용 흐름', '목표에서 실행 일정까지']) {
  assert.match(explore, new RegExp(text));
}
for (const text of ['설정', '기상 시간', '시간대', '설정 저장']) {
  assert.match(`${settings}\n${settingsView}`, new RegExp(text));
}
for (const token of ['TaskSummaryPanel', 'GoalBreakdownPanel', 'PlanningCreateSections']) {
  assert.match(planning, new RegExp(token));
  assert.doesNotMatch(dashboard, new RegExp(token));
}
for (const token of ['DailyReviewPanel', 'WeeklyReschedulePanel']) {
  assert.match(review, new RegExp(token));
  assert.doesNotMatch(dashboard, new RegExp(token));
}

assert.match(settings, /TabScreenScrollView keyboardAvoiding/);
assert.match(tabScreen, /KeyboardAvoidingView/);
assert.match(tabScreen, /edges={\['left', 'right', 'bottom'\]}/);
assert.match(home, /TabScreenFrame/);
assert.match(settingsView, /PlanningTextInput/);
assert.match(settingsView, /PlanningButton/);
assert.match(settingsView, /accessibilityLiveRegion="polite"/);
assert.match(protectedRow, /validProtectedTimeRange/);
assert.match(protectedRow, /12:00–13:00/);
assert.match(controls, /accessibilityRole="button"/);
assert.match(controls, /size="lg"/);

assert.match(metro, /path\.join\(__dirname, 'src\/global\.css'\)/);
assert.match(rootLayout, /from 'nativewind'/);
assert.match(rootLayout, /NAV_THEME\[mode\]/);
assert.match(globalCss, /--destructive-foreground:/);
assert.match(input, /placeholderTextColor={placeholderTextColor \?\? theme\.textSecondary}/);
assert.match(textarea, /placeholderTextColor={placeholderTextColor \?\? theme\.textSecondary}/);
assert.doesNotMatch(input, /placeholder:text-muted-foreground\/50/);

console.log('navigation UI validation passed');
