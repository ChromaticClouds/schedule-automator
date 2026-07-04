import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const cache = new Map();

const loadTypeScriptModule = (relativePath) => {
  if (cache.has(relativePath)) return cache.get(relativePath);
  const source = readFileSync(join(root, relativePath), 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  cache.set(relativePath, module.exports);
  const require = (path) => {
    if (path === './weekly-reschedule-state') {
      return loadTypeScriptModule(
        'src/features/planning/weekly-reschedule-state.ts',
      );
    }
    throw new Error(`Unsupported fixture import: ${path}`);
  };
  Function('exports', 'module', 'require', output)(module.exports, module, require);
  cache.set(relativePath, module.exports);
  return module.exports;
};

const state = loadTypeScriptModule(
  'src/features/planning/weekly-reschedule-state.ts',
);
const { weeklyRescheduleFixtures, weeklyRescheduleRerunFixtures } =
  loadTypeScriptModule(
    'src/features/planning/weekly-reschedule-fixtures.ts',
  );

const errorWithCode = (code) => ({
  details: { details: { code } },
  message: 'fallback message',
});

const expectedMessages = [
  ['REQUEST_IN_PROGRESS', 'already running'],
  ['IDEMPOTENCY_CONFLICT', 'context changed'],
  ['REPLAN_PROVIDER_ERROR', 'provider is unavailable'],
  ['REPLAN_SCHEMA_ERROR', 'format was invalid'],
  ['REPLAN_VALIDATION_ERROR', 'not safe to use'],
  ['REPLAN_PERSISTENCE_ERROR', 'Could not save'],
  ['GOOGLE_RECONNECT_REQUIRED', 'Reconnect Google'],
];

for (const [code, expected] of expectedMessages) {
  assert.match(
    state.weeklyRescheduleErrorMessage(errorWithCode(code)),
    new RegExp(expected),
  );
}

assert.equal(
  state.weeklyRescheduleErrorMessage({ message: 'fallback' }),
  'fallback',
);
assert.equal(weeklyRescheduleRerunFixtures.newMissedTask, true);
assert.equal(weeklyRescheduleRerunFixtures.unchanged, false);
assert.equal(weeklyRescheduleFixtures.empty.disabled, true);
assert.equal(weeklyRescheduleFixtures.pending.isPending, true);
assert.equal(weeklyRescheduleFixtures.placed.result.placedTaskIds.length, 1);
assert.equal(weeklyRescheduleFixtures.overflow.result.overflowTaskIds.length, 1);
assert.equal(weeklyRescheduleFixtures.replayed.result.replayed, true);
assert.match(weeklyRescheduleFixtures.schemaError.errorMessage, /format/);
assert.match(weeklyRescheduleFixtures.saveError.errorMessage, /save/);
assert.match(
  state.weeklyRescheduleResultSummary(weeklyRescheduleFixtures.placed.result),
  /Placed 1 · Overflow 0/,
);

const viewSource = readFileSync(
  join(root, 'src/features/planning/weekly-reschedule-view.tsx'),
  'utf8',
);
assert.equal(viewSource.includes('쨌'), false);
assert.match(viewSource, /Review generated drafts/);

console.log('weekly reschedule UI validation passed');
