import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const allowLoopback = process.env.ALLOW_LOOPBACK_DEVICE_API === 'true';
const forwardedArgs = process.argv.slice(2);

const fail = (message) => {
  console.error(`device smoke setup failed: ${message}`);
  process.exit(1);
};

if (!apiBaseUrl) {
  fail('set EXPO_PUBLIC_API_BASE_URL to a LAN-reachable server URL');
}

let parsedUrl;
try {
  parsedUrl = new URL(apiBaseUrl);
} catch {
  fail('EXPO_PUBLIC_API_BASE_URL must be a valid URL');
}

const loopbackHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);
const isLoopback = loopbackHosts.has(parsedUrl.hostname);

if (isLoopback && !allowLoopback) {
  fail('use your computer LAN IP for physical devices, not localhost');
}

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const args = ['exec', 'expo', 'start', '--lan', ...forwardedArgs];
const env = {
  ...process.env,
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  EXPO_PUBLIC_ENABLE_MOCK_AUTH: 'false',
  EXPO_PUBLIC_ENABLE_MOCK_CALENDAR: 'false',
  EXPO_PUBLIC_ENABLE_DEV_TOOLS:
    process.env.EXPO_PUBLIC_ENABLE_DEV_TOOLS ?? 'true',
};

console.log(`Starting Expo device smoke against ${parsedUrl.origin}`);
console.log('Mocks are disabled for auth and calendar integration.');

const result = spawnSync(command, args, {
  cwd: root,
  env,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
