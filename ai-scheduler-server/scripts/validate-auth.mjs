import { strict as assert } from 'node:assert';
import {
  createOAuthState,
  decryptSecret,
  encryptSecret,
  verifyOAuthState,
} from '../dist/auth/security.js';

const secret = 'local-validation-secret-with-enough-entropy';
const userId = '507f1f77bcf86cd799439011';
const now = Date.parse('2026-07-03T00:00:00.000Z');

const state = createOAuthState(userId, secret, now);
assert.equal(verifyOAuthState(state, secret, now).userId, userId);
assert.throws(() => verifyOAuthState(state, secret, now + 10 * 60 * 1000));

const tamperedState = `${state.slice(0, -1)}${state.endsWith('a') ? 'b' : 'a'}`;
assert.throws(() => verifyOAuthState(tamperedState, secret, now));

const encrypted = encryptSecret('oauth-access-token', secret);
assert.equal(encrypted.includes('oauth-access-token'), false);
assert.equal(decryptSecret(encrypted, secret), 'oauth-access-token');
assert.throws(() => decryptSecret(encrypted, `${secret}-wrong`));

console.log('auth security validation passed');
