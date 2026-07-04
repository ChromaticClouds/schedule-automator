import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = join(root, 'src');
const binDir = join(root, 'node_modules', '.bin');
const secretPattern = /gho_|sk-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{20,}|BEGIN .*PRIVATE KEY/;

const fail = (message) => {
  console.error(`server validation failed: ${message}`);
  process.exitCode = 1;
};

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });

const run = (name, args) => {
  const binary = join(binDir, process.platform === 'win32' ? `${name}.CMD` : name);

  if (!existsSync(binary)) {
    fail(`missing local ${name} binary`);
    return;
  }

  const command = process.platform === 'win32' ? 'cmd.exe' : binary;
  const commandArgs =
    process.platform === 'win32' ? ['/c', binary, ...args] : args;
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    fail(`${name} ${args.join(' ')} failed`);
  }
};

const runNode = (script) => {
  const result = spawnSync(process.execPath, [join(root, script)], {
    cwd: root,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    fail(`node ${script} failed`);
  }
};

const sourceFiles = walk(sourceRoot).filter((file) =>
  ['.ts', '.mts'].includes(extname(file)),
);

for (const file of sourceFiles) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/).length;

  if (lines > 150) {
    fail(`${file} has ${lines} lines`);
  }

  if (secretPattern.test(text)) {
    fail(`${file} appears to contain a committed secret`);
  }
}

run('tsc', ['--noEmit']);
run('tsc', []);
run('tsc-alias', []);
runNode('scripts/validate-auth.mjs');
runNode('scripts/validate-calendar.mjs');
runNode('scripts/validate-daily-schedule-worker.mjs');
runNode('scripts/validate-daily-review.mjs');
runNode('scripts/validate-schedule-draft.mjs');
runNode('scripts/validate-schedule-lifecycle.mjs');
runNode('scripts/validate-schedule-preferences.mjs');
runNode('scripts/validate-session.mjs');
runNode('scripts/validate-task-breakdown.mjs');
runNode('scripts/validate-weekly-reschedule.mjs');
run('eslint', ['.']);
