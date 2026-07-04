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
const { scheduleDraftFixtures, scheduleDraftPanelFixtures } = loadTypeScriptModule(
  'src/features/planning/schedule-draft-fixtures.ts',
);

const errorWithCode = (code) => ({
  details: { details: { code } },
  message: 'fallback message',
  status: 409,
});

const expectedMessages = [
  ['REQUEST_IN_PROGRESS', 'already running'],
  ['STALE_DRAFT_CONTEXT', 'Generate a fresh draft'],
  ['INVALID_DRAFT_STATE', 'Refresh and try again'],
  ['STALE_DRAFT_VERSION', 'Review the latest version'],
  ['DRAFT_EDIT_VALIDATION_ERROR', 'conflicts with the current schedule'],
  ['DRAFT_BLOCK_NOT_EDITABLE', 'cannot be edited'],
  ['GOOGLE_RECONNECT_REQUIRED', 'Reconnect Google'],
  ['GOOGLE_CALENDAR_SYNC_FAILED', 'sync failed'],
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
  /pending/,
);
assert.match(
  state.scheduleDraftStatusMessage(scheduleDraftFixtures.synced),
  /synced/,
);
assert.equal(
  state.scheduleDraftCalendarEventSummary(scheduleDraftFixtures.approved),
  undefined,
);
assert.match(
  state.scheduleDraftCalendarEventSummary(scheduleDraftFixtures.synced),
  /2 calendar events synced/,
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
  [recoveryAction(scheduleDraftFixtures.draft, false, 'STALE_DRAFT_CONTEXT').label, 'Regenerate fresh draft'],
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

for (const status of ['draft', 'approved', 'rejected', 'expired', 'synced']) {
  assert.equal(scheduleDraftPanelFixtures[status].draft.status, status);
}

assert.match(scheduleDraftPanelFixtures.editValidationError.errorMessage, /conflicts/);
assert.match(scheduleDraftPanelFixtures.regenerateInvalidStateError.errorMessage, /state changed/);
assert.match(scheduleDraftPanelFixtures.googleReconnectError.errorMessage, /Reconnect/);
assert.match(scheduleDraftPanelFixtures.googleSyncError.errorMessage, /sync failed/);
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
