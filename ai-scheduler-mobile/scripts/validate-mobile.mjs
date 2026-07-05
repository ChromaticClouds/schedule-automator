import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = join(root, 'src');
const allowedEnvNames = new Set(['EXPO_OS']);
const secretPattern =
  /GEMINI|GOOGLE_CLIENT_SECRET|JWT_SECRET|SESSION_SECRET|ENCRYPTION_KEY|MONGO_URL|DATABASE_URL/;

const fail = (message) => {
  console.error(`mobile validation failed: ${message}`);
  process.exitCode = 1;
};

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });

const sourceFiles = walk(sourceRoot).filter((file) =>
  ['.ts', '.tsx'].includes(extname(file)),
);

for (const file of sourceFiles) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/).length;

  if (lines > 150) {
    fail(`${file} has ${lines} lines`);
  }

  if (secretPattern.test(text)) {
    fail(`${file} references server-only secret or database env names`);
  }

  for (const match of text.matchAll(/process\.env\.([A-Z0-9_]+)/g)) {
    const name = match[1];
    if (!name.startsWith('EXPO_PUBLIC_') && !allowedEnvNames.has(name)) {
      fail(`${file} reads non-public env ${name}`);
    }
  }
}

const envExample = readFileSync(join(root, '.env.example'), 'utf8');
const apiBaseUrl = envExample.match(/^EXPO_PUBLIC_API_BASE_URL=(.+)$/m)?.[1];

if (!apiBaseUrl) {
  fail('.env.example is missing EXPO_PUBLIC_API_BASE_URL');
} else {
  try {
    new URL(apiBaseUrl);
  } catch {
    fail('.env.example EXPO_PUBLIC_API_BASE_URL is not a valid URL');
  }
}

const readSource = (path) => readFileSync(join(sourceRoot, path), 'utf8');
const planningApi = readSource('features/planning/api.ts');
const apiClient = readSource('api/client.ts');
const authStorage = readSource('features/auth/storage.ts');
const authSession = readSource('features/auth/session.ts');
const oauthFlow = readSource('features/auth/oauth.ts');
const queryProvider = readSource('components/query-provider.tsx');

if (planningApi.includes('x-user-id')) {
  fail('planning API still uses temporary x-user-id auth');
}

if (
  !apiClient.includes('Authorization') ||
  !apiClient.includes('refreshAuthSession')
) {
  fail('API client is missing Bearer auth or refresh retry');
}

if (!authStorage.includes('expo-secure-store')) {
  fail('auth session storage does not use Expo SecureStore');
}

if (
  !authSession.includes('saveAuthSession(response, startedAtVersion)') ||
  !authSession.includes('clearAuthSession(startedAtVersion)') ||
  !authSession.includes('mutateStoredSession')
) {
  fail('refresh persistence is missing stale-session guards');
}

if (
  !queryProvider.includes('registerAuthCacheReset') ||
  !queryProvider.includes("queryKey: ['planning']") ||
  !queryProvider.includes('resetQueries')
) {
  fail('planning cache is not cleared across auth boundaries');
}

if (
  !oauthFlow.includes('codeChallenge') ||
  !oauthFlow.includes('Linking.createURL') ||
  !oauthFlow.includes('returnTo') ||
  !oauthFlow.includes('handoffCode') ||
  !oauthFlow.includes('openAuthSessionAsync') ||
  !oauthFlow.includes('resetAuthCache: true')
) {
  fail('OAuth flow is missing PKCE, handoff, browser session, or cache reset handling');
}

const runValidation = (script, message) => {
  const result = spawnSync(process.execPath, [join(root, 'scripts', script)], {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.status !== 0) fail(message);
};

runValidation('validate-goal-breakdown.mjs', 'goal breakdown state validation failed');
runValidation('validate-navigation-ui.mjs', 'navigation UI validation failed');
runValidation('validate-planning-create-flow.mjs', 'planning create flow validation failed');
runValidation('validate-planning-state-catalog.mjs', 'planning state catalog validation failed');
runValidation('validate-planning-state-preview.mjs', 'planning state preview validation failed');
runValidation('validate-schedule-draft-ui.mjs', 'schedule draft UI validation failed');
runValidation('validate-storybook.mjs', 'storybook validation failed');
runValidation('validate-e2e.mjs', 'planning E2E validation failed');
runValidation('validate-device-smoke.mjs', 'device smoke validation failed');
runValidation('validate-visual-screenshots.mjs', 'visual screenshot validation failed');
runValidation('validate-weekly-reschedule-ui.mjs', 'weekly reschedule UI validation failed');

const tsc = join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc');

if (!existsSync(tsc)) {
  fail('missing local TypeScript binary');
} else {
  const command = process.platform === 'win32' ? 'cmd.exe' : tsc;
  const args =
    process.platform === 'win32' ? ['/c', tsc, '--noEmit'] : ['--noEmit'];
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    fail('TypeScript check failed');
  }
}
