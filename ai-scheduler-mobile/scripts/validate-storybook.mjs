import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const read = (path) => readFileSync(join(root, path), 'utf8');
const packageJson = JSON.parse(read('package.json'));
const entry = read('index.js');
const metro = read('metro.config.js');
const main = read('.rnstorybook/main.ts');
const index = read('.rnstorybook/index.ts');
const requires = read('.rnstorybook/storybook.requires.ts');
const story = read('src/features/planning/planning-state-preview.stories.tsx');

assert.equal(packageJson.main, 'index.js');
assert.equal(packageJson.devDependencies['@storybook/react-native'], '10.4.7');
assert.equal(packageJson.devDependencies['@storybook/addon-ondevice-actions'], '10.4.7');
assert.match(packageJson.scripts.storybook, /EXPO_PUBLIC_STORYBOOK_ENABLED=true/);
assert.match(packageJson.scripts['storybook:web'], /EXPO_PUBLIC_API_BASE_URL=/);
assert.match(metro, /enabled: process\.env\.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true'/);
assert.match(entry, /process\.env\.EXPO_PUBLIC_STORYBOOK_ENABLED/);
assert.match(entry, /registerRootComponent\(StorybookUIRoot\)/);
assert.match(entry, /require\('expo-router\/entry'\)/);
assert.match(main, /src\/features\/\*\*\/\*\.stories/);
assert.match(main, /addon-ondevice-controls/);
assert.match(main, /addon-ondevice-actions/);
assert.match(index, /shouldPersistSelection: false/);
assert.match(requires, /require\.context\(\s*'\.\.\/src\/features'/);
assert.match(story, /PlanningStatePreview/);
assert.match(story, /Planning\/State Preview/);
assert.match(story, /Catalog/);

console.log('storybook validation passed');
