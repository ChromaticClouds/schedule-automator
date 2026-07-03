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
