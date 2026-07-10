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
  'src/features/planning/schedule-draft-state.ts',
);
const composer = readFileSync(
  join(root, 'src/features/planning/schedule-draft-composer.tsx'),
  'utf8',
);
const { scheduleDraftFixtures, scheduleDraftPanelFixtures } = loadTypeScriptModule(
  'src/features/planning/schedule-draft-fixtures.ts',
);

const errorWithCode = (code) => ({
  details: { details: { code } },
  message: 'fallback message',
  status: 409,
});

const expectedMessages = [
  ['REQUEST_IN_PROGRESS', '이미 생성 중'],
  ['STALE_DRAFT_CONTEXT', '새 초안을 생성'],
  ['INVALID_DRAFT_STATE', '새로고침 후 다시 시도'],
  ['STALE_DRAFT_VERSION', '최신 버전'],
  ['DRAFT_EDIT_VALIDATION_ERROR', '충돌하는 수정'],
  ['DRAFT_BLOCK_NOT_EDITABLE', '수정할 수 없습니다'],
  ['GOOGLE_RECONNECT_REQUIRED', '다시 연결'],
  ['GOOGLE_CALENDAR_SYNC_FAILED', '동기화에 실패'],
];

for (const [code, expected] of expectedMessages) {
  assert.match(
    state.scheduleDraftErrorMessage(errorWithCode(code)),
    new RegExp(expected),
  );
}

assert.equal(
  state.scheduleDraftErrorMessage({ message: 'not found', status: 404 }, true),
  undefined,
);
assert.equal(
  state.scheduleDraftErrorMessage({ message: 'fallback' }),
  'fallback',
);

const boolChecks = [
  [state.canGenerateScheduleDraft(undefined, true), true],
  [state.canGenerateScheduleDraft(scheduleDraftFixtures.rejected, false), true],
  [state.canGenerateScheduleDraft(scheduleDraftFixtures.expired, false), true],
  [state.canGenerateScheduleDraft(scheduleDraftFixtures.draft, false), false],
  [state.canReviewScheduleDraft(scheduleDraftFixtures.draft), true],
  [state.canReviewScheduleDraft(scheduleDraftFixtures.synced), false],
  [state.canRegenerateScheduleDraft(scheduleDraftFixtures.draft), true],
  [state.canRegenerateScheduleDraft(scheduleDraftFixtures.rejected), true],
  [state.canRegenerateScheduleDraft(scheduleDraftFixtures.expired), true],
  [state.canRegenerateScheduleDraft(scheduleDraftFixtures.synced), false],
  [state.canRetryScheduleDraftSync(scheduleDraftFixtures.approved), true],
  [state.canRetryScheduleDraftSync(scheduleDraftFixtures.synced), false],
];

for (const [actual, expected] of boolChecks) assert.equal(actual, expected);
assert.match(
  state.scheduleDraftStatusMessage(scheduleDraftFixtures.approved),
  /기다리는 중/,
);
assert.match(
  state.scheduleDraftStatusMessage(scheduleDraftFixtures.synced),
  /동기화되었습니다/,
);
assert.equal(
  state.scheduleDraftCalendarEventSummary(scheduleDraftFixtures.approved),
  undefined,
);
assert.match(
  state.scheduleDraftCalendarEventSummary(scheduleDraftFixtures.synced),
  /2개가 동기화/,
);
const recoveryAction = state.scheduleDraftRecoveryAction;
assert.equal(recoveryAction(scheduleDraftFixtures.synced, false), undefined);
assert.equal(recoveryAction(undefined, true, 'REQUEST_IN_PROGRESS'), undefined);
const actionChecks = [
  [recoveryAction(scheduleDraftFixtures.approved, false).kind, 'retry-sync'],
  [recoveryAction(undefined, true).kind, 'generate'],
  [recoveryAction(scheduleDraftFixtures.draft, false).kind, 'regenerate'],
  [recoveryAction(scheduleDraftFixtures.draft, false, 'GOOGLE_RECONNECT_REQUIRED').kind, 'reconnect-google'],
  [recoveryAction(scheduleDraftFixtures.approved, false, 'GOOGLE_CALENDAR_SYNC_FAILED').kind, 'retry-sync'],
  [recoveryAction(scheduleDraftFixtures.draft, false, 'STALE_DRAFT_CONTEXT').label, '새 초안 다시 생성'],
];

for (const [actual, expected] of actionChecks) assert.equal(actual, expected);

const requiredFixtureNames = [
  'loading', 'empty', 'draft', 'approved', 'pending', 'rejected',
  'expired', 'synced', 'requestInProgressError',
  'regenerateInvalidStateError', 'googleReconnectError',
  'googleSyncError', 'staleContextError', 'staleVersionError',
  'editValidationError', 'blockNotEditableError',
];

for (const name of requiredFixtureNames) {
  assert.ok(scheduleDraftPanelFixtures[name], `${name} fixture is missing`);
  assert.equal(typeof scheduleDraftPanelFixtures[name].onGenerate, 'function');
  assert.equal(typeof scheduleDraftPanelFixtures[name].onReconnect, 'function');
  assert.equal(typeof scheduleDraftPanelFixtures[name].onRegenerate, 'function');
}

assert.equal(scheduleDraftPanelFixtures.loading.isLoading, true);
assert.equal(scheduleDraftPanelFixtures.empty.noDraft, true);
assert.equal(scheduleDraftPanelFixtures.pending.busy, true);
assert.match(composer, /Textarea/);
assert.match(composer, /useScheduleDraftComposerStore/);
assert.match(composer, /maxInstructionLength = 500/);
assert.match(composer, /onGenerate\(message\)/);
assert.match(composer, /disabled=\{busy \|\| !message\}/);

for (const status of ['draft', 'approved', 'rejected', 'expired', 'synced']) {
  assert.equal(scheduleDraftPanelFixtures[status].draft.status, status);
}

assert.match(scheduleDraftPanelFixtures.editValidationError.errorMessage, /충돌/);
assert.match(scheduleDraftPanelFixtures.regenerateInvalidStateError.errorMessage, /상태가 변경/);
assert.match(scheduleDraftPanelFixtures.googleReconnectError.errorMessage, /다시 연결/);
assert.match(scheduleDraftPanelFixtures.googleSyncError.errorMessage, /동기화에 실패/);
assert.equal(scheduleDraftPanelFixtures.googleReconnectError.errorCode, 'GOOGLE_RECONNECT_REQUIRED');
assert.equal(scheduleDraftPanelFixtures.googleSyncError.errorCode, 'GOOGLE_CALENDAR_SYNC_FAILED');

for (const block of scheduleDraftFixtures.draft.blocks) {
  assert.ok(block._id);
  assert.ok(block.title);
  assert.ok(Date.parse(block.start));
  assert.ok(Date.parse(block.end));
  assert.ok(['ai', 'calendar', 'system', 'user'].includes(block.source));
}

console.log('schedule draft UI validation passed');
