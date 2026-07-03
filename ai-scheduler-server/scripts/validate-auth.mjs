import { strict as assert } from 'node:assert';
import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import {
  createOAuthState,
  decryptSecret,
  encryptSecret,
  verifyOAuthState,
} from '../dist/auth/security.js';
import {
  createCodeChallenge,
  createRefreshCredential,
  parseRefreshCredential,
  rotateRefreshCredential,
  verifyCodeChallenge,
} from '../dist/auth/session-security.js';
import { requireVerifiedGoogleIdentity } from '../dist/auth/google-identity.js';

const secret = 'local-validation-secret-with-enough-entropy';
const userId = '507f1f77bcf86cd799439011';
const now = Date.parse('2026-07-03T00:00:00.000Z');
const verifier = 'a'.repeat(43);
const challenge = createCodeChallenge(verifier);

const state = createOAuthState(challenge, secret, now);
assert.equal(verifyOAuthState(state, secret, now).codeChallenge, challenge);
assert.throws(() => verifyOAuthState(state, secret, now + 10 * 60 * 1000));

const tamperedState = `${state.slice(0, -1)}${state.endsWith('a') ? 'b' : 'a'}`;
assert.throws(() => verifyOAuthState(tamperedState, secret, now));

const encrypted = encryptSecret('oauth-access-token', secret);
assert.equal(encrypted.includes('oauth-access-token'), false);
assert.equal(decryptSecret(encrypted, secret), 'oauth-access-token');
assert.throws(() => decryptSecret(encrypted, `${secret}-wrong`));

assert.equal(verifyCodeChallenge(verifier, challenge), true);
assert.equal(verifyCodeChallenge(`${verifier}x`, challenge), false);

const identity = requireVerifiedGoogleIdentity({
  email: ' USER@Example.com ',
  id: 'google-user-id',
  name: ' Schedule User ',
  verified_email: true,
});
assert.deepEqual(identity, {
  displayName: 'Schedule User',
  email: 'user@example.com',
  googleSub: 'google-user-id',
});
assert.throws(() =>
  requireVerifiedGoogleIdentity({
    email: 'user@example.com',
    id: 'google-user-id',
    verified_email: false,
  }),
);
assert.throws(() =>
  requireVerifiedGoogleIdentity({
    email: 'user@example.com',
    id: 'google-user-id',
  }),
);

const credential = createRefreshCredential(secret);
const parsed = parseRefreshCredential(credential.token);
assert.equal(parsed.sessionId, credential.sessionId);
assert.equal(parsed.secret, credential.secret);
assert.equal(parseRefreshCredential('invalid'), null);

const rotated = rotateRefreshCredential(credential.sessionId, secret);
assert.notEqual(rotated.token, credential.token);
assert.equal(
  parseRefreshCredential(rotated.token).sessionId,
  credential.sessionId,
);

const app = Fastify();
await app.register(jwt, {
  secret,
  sign: {
    aud: 'ai-scheduler-mobile',
    expiresIn: 900,
    iss: 'ai-scheduler-server',
  },
  verify: {
    allowedAud: 'ai-scheduler-mobile',
    allowedIss: 'ai-scheduler-server',
  },
});
const accessToken = app.jwt.sign({
  jti: 'validation-token-id',
  sid: credential.sessionId,
  sub: userId,
  type: 'access',
});
const accessPayload = app.jwt.verify(accessToken);
assert.equal(accessPayload.sub, userId);
assert.equal(accessPayload.type, 'access');
await app.close();

console.log('auth security validation passed');
