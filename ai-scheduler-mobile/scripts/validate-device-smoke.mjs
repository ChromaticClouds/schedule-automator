import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const repoRoot = join(root, '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const readRepo = (path) => readFileSync(join(repoRoot, path), 'utf8');

const packageJson = JSON.parse(read('package.json'));
const startScript = read('scripts/start-device-smoke.mjs');
const guide = readRepo('docs/mobile-device-integration.md');

assert.equal(typeof packageJson.scripts['device:smoke'], 'string');
assert.equal(typeof packageJson.scripts['device:android'], 'string');
assert.equal(typeof packageJson.scripts['device:ios'], 'string');
assert.match(startScript, /EXPO_PUBLIC_API_BASE_URL/);
assert.match(startScript, /ALLOW_LOOPBACK_DEVICE_API/);
assert.match(startScript, /EXPO_PUBLIC_ENABLE_MOCK_AUTH: 'false'/);
assert.match(startScript, /EXPO_PUBLIC_ENABLE_MOCK_CALENDAR: 'false'/);
assert.match(startScript, /expo', 'start', '--lan'/);
assert.match(guide, /same Wi-Fi/);
assert.match(guide, /EXPO_PUBLIC_API_BASE_URL=http:\/\/<LAN_IP>:3000/);
assert.match(guide, /Do not commit/);

console.log('device smoke validation passed');
