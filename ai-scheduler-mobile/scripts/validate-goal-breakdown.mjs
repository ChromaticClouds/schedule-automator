import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

const loadTypeScriptModule = (relativePath) => {
  const source = readFileSync(join(root, relativePath), 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  Function('exports', 'module', output)(module.exports, module);
  return module.exports;
};

const state = loadTypeScriptModule(
  'src/features/planning/goal-breakdown-state.ts',
);
const { goalBreakdownFixtures: fixtures } = loadTypeScriptModule(
  'src/features/planning/goal-breakdown-fixtures.ts',
);

const errorCases = [
  [fixtures.authError, 'Session expired'],
  [fixtures.inProgress, 'still running'],
  [fixtures.conflict, 'Goal changed'],
  [fixtures.schemaError, 'invalid task plan'],
  [fixtures.providerError, 'AI service is unavailable'],
  [fixtures.persistenceError, 'could not be saved'],
  [fixtures.networkError, 'Network unavailable'],
];

for (const [error, expected] of errorCases) {
  const feedback = state.goalBreakdownErrorFeedback(error);
  assert.match(feedback.message, new RegExp(expected));
}

assert.deepEqual(state.goalBreakdownSuccessFeedback(fixtures.success), {
  kind: 'success',
  message: '2 tasks generated.',
});
assert.deepEqual(state.goalBreakdownSuccessFeedback(fixtures.replay), {
  kind: 'success',
  message: '1 generated tasks restored.',
});

console.log('goal breakdown validation passed');
