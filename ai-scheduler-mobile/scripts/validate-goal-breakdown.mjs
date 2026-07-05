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
  [fixtures.authError, '세션이 만료'],
  [fixtures.inProgress, '아직 진행 중'],
  [fixtures.conflict, '목표가 변경'],
  [fixtures.schemaError, '올바르지 않은 작업 계획'],
  [fixtures.providerError, 'AI 서비스 요청이 실패'],
  [fixtures.persistenceError, '작업을 저장하지 못했습니다'],
  [fixtures.networkError, '네트워크를 사용할 수 없습니다'],
];

for (const [error, expected] of errorCases) {
  const feedback = state.goalBreakdownErrorFeedback(error);
  assert.match(feedback.message, new RegExp(expected));
}

assert.deepEqual(state.goalBreakdownSuccessFeedback(fixtures.success), {
  kind: 'success',
  message: '작업 2개를 생성했습니다.',
});
assert.deepEqual(state.goalBreakdownSuccessFeedback(fixtures.replay), {
  kind: 'success',
  message: '생성된 작업 1개를 복구했습니다.',
});

console.log('goal breakdown validation passed');
