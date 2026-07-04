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

assert.equal(state.canGenerateScheduleDraft(undefined, true), true);
assert.equal(
  state.canGenerateScheduleDraft(scheduleDraftFixtures.rejected, false),
  true,
);
assert.equal(
  state.canGenerateScheduleDraft(scheduleDraftFixtures.expired, false),
  true,
);
assert.equal(
  state.canGenerateScheduleDraft(scheduleDraftFixtures.draft, false),
  false,
);
assert.equal(state.canReviewScheduleDraft(scheduleDraftFixtures.draft), true);
assert.equal(state.canReviewScheduleDraft(scheduleDraftFixtures.synced), false);
assert.equal(state.canRegenerateScheduleDraft(scheduleDraftFixtures.draft), true);
assert.equal(state.canRegenerateScheduleDraft(scheduleDraftFixtures.rejected), true);
assert.equal(state.canRegenerateScheduleDraft(scheduleDraftFixtures.expired), true);
assert.equal(state.canRegenerateScheduleDraft(scheduleDraftFixtures.synced), false);

const requiredFixtureNames = [
  'loading',
  'empty',
  'draft',
  'pending',
  'rejected',
  'expired',
  'synced',
  'requestInProgressError',
  'regenerateInvalidStateError',
  'staleContextError',
  'staleVersionError',
  'editValidationError',
  'blockNotEditableError',
];

for (const name of requiredFixtureNames) {
  assert.ok(scheduleDraftPanelFixtures[name], `${name} fixture is missing`);
  assert.equal(typeof scheduleDraftPanelFixtures[name].onGenerate, 'function');
  assert.equal(typeof scheduleDraftPanelFixtures[name].onRegenerate, 'function');
}

assert.equal(scheduleDraftPanelFixtures.loading.isLoading, true);
assert.equal(scheduleDraftPanelFixtures.empty.noDraft, true);
assert.equal(scheduleDraftPanelFixtures.pending.busy, true);
assert.equal(scheduleDraftPanelFixtures.draft.draft.status, 'draft');
assert.equal(scheduleDraftPanelFixtures.rejected.draft.status, 'rejected');
assert.equal(scheduleDraftPanelFixtures.expired.draft.status, 'expired');
assert.equal(scheduleDraftPanelFixtures.synced.draft.status, 'synced');
assert.match(
  scheduleDraftPanelFixtures.editValidationError.errorMessage,
  /conflicts/,
);
assert.match(
  scheduleDraftPanelFixtures.regenerateInvalidStateError.errorMessage,
  /state changed/,
);

for (const block of scheduleDraftFixtures.draft.blocks) {
  assert.ok(block._id);
  assert.ok(block.title);
  assert.ok(Date.parse(block.start));
  assert.ok(Date.parse(block.end));
  assert.ok(['ai', 'calendar', 'system', 'user'].includes(block.source));
}

console.log('schedule draft UI validation passed');
