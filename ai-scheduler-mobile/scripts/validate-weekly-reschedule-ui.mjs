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
  ['REQUEST_IN_PROGRESS', '이미 실행 중'],
  ['IDEMPOTENCY_CONFLICT', '컨텍스트가 변경'],
  ['REPLAN_PROVIDER_ERROR', '사용할 수 없습니다'],
  ['REPLAN_SCHEMA_ERROR', '형식이 올바르지 않습니다'],
  ['REPLAN_VALIDATION_ERROR', '안전하게 사용할 수 없습니다'],
  ['REPLAN_PERSISTENCE_ERROR', '저장하지 못했습니다'],
  ['GOOGLE_RECONNECT_REQUIRED', '다시 연결'],
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
assert.match(weeklyRescheduleFixtures.schemaError.errorMessage, /형식/);
assert.match(weeklyRescheduleFixtures.saveError.errorMessage, /저장/);
assert.match(
  state.weeklyRescheduleResultSummary(weeklyRescheduleFixtures.placed.result),
  /배치 1개 \/ 보류 0개/,
);

const viewSource = readFileSync(
  join(root, 'src/features/planning/weekly-reschedule-view.tsx'),
  'utf8',
);
assert.equal(viewSource.includes('쨌'), false);
assert.match(viewSource, /생성된 초안/);

console.log('weekly reschedule UI validation passed');
