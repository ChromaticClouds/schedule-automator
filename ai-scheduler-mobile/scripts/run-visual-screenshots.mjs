import { spawnSync } from 'node:child_process';

const mode = process.env.VISUAL_RUN_MODE ?? 'capture';
const pnpmCli = process.env.npm_execpath;
const command = pnpmCli ? process.execPath : 'pnpm';
const args = pnpmCli
  ? [pnpmCli, 'exec', 'playwright', 'test']
  : ['exec', 'playwright', 'test'];
const env = { ...process.env };

if (mode === 'capture') {
  env.VISUAL_MODE = 'capture';
} else if (mode === 'update') {
  args.push('--update-snapshots');
} else if (mode !== 'test') {
  console.error(
    `Unsupported VISUAL_RUN_MODE "${mode}". Use capture, test, or update.`,
  );
  process.exit(1);
}

const result = spawnSync(command, args, {
  env,
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error.message);
}

process.exit(result.status ?? 1);
