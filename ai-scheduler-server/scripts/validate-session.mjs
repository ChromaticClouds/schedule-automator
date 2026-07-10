import { strict as assert } from 'node:assert';

Object.assign(process.env, {
  APP_ORIGIN: 'aischedulermobile://',
  CORS_ORIGIN: 'http://localhost:8081',
  ENCRYPTION_KEY: 'validation-encryption-key-with-32-characters',
  GEMINI_API_KEY: 'validation-gemini-key',
  GOOGLE_CALENDAR_SCOPES: 'calendar',
  GOOGLE_CLIENT_ID: 'validation-client-id',
  GOOGLE_CLIENT_SECRET: 'validation-client-secret',
  GOOGLE_REDIRECT_URI: 'http://localhost/auth/google/callback',
  JWT_SECRET: 'validation-jwt-secret-with-32-characters',
  MONGO_URL: 'mongodb://localhost/validation',
  QUEUE_NAME: 'validation',
  REDIS_URL: 'rediss://redis.example.com:6379',
  REFRESH_TOKEN_PEPPER: 'validation-refresh-pepper-with-32-characters',
  SERVER_BASE_URL: 'http://localhost:3000',
  SESSION_SECRET: 'validation-session-secret-with-32-characters',
});

const {
  consumeAuthHandoff,
  createAuthHandoff,
  createAuthSession,
  revokeAuthSession,
  rotateAuthSession,
} = await import('../dist/services/auth-session.js');
const { createCodeChallenge } = await import(
  '../dist/core/auth/session-security.js'
);

class FakeRedis {
  hashes = new Map();
  strings = new Map();

  async set(key, value) {
    this.strings.set(key, value);
  }

  async eval(script, _count, key, ...args) {
    if (script.includes("redis.call('GET'")) {
      const value = this.strings.get(key) ?? null;
      this.strings.delete(key);
      return value;
    }

    const hash = this.hashes.get(key);
    if (script.includes('ARGV[2]')) {
      if (!hash) return [0];
      if (hash.refreshHash !== args[0]) {
        this.hashes.delete(key);
        return [-1];
      }
      hash.refreshHash = args[1];
      return [1, hash.userId];
    }

    if (!hash || hash.refreshHash !== args[0]) return 0;
    this.hashes.delete(key);
    return 1;
  }

  multi() {
    const transaction = {
      exec: async () => [],
      expire: () => transaction,
      hset: (key, ...entries) => {
        this.hashes.set(key, {
          refreshHash: entries[3],
          userId: entries[1],
        });
        return transaction;
      },
    };
    return transaction;
  }
}

const redis = new FakeRedis();
const userId = '507f1f77bcf86cd799439011';
const verifier = 'a'.repeat(43);
const challenge = createCodeChallenge(verifier);

const code = await createAuthHandoff(redis, userId, challenge);
assert.equal(await consumeAuthHandoff(redis, code, verifier), userId);
assert.equal(await consumeAuthHandoff(redis, code, verifier), null);

const session = await createAuthSession(redis, userId);
const rotated = await rotateAuthSession(redis, session.token);
assert.equal(rotated.userId, userId);
assert.notEqual(rotated.refreshToken, session.token);
assert.equal(await revokeAuthSession(redis, rotated.refreshToken), true);
assert.equal(await rotateAuthSession(redis, rotated.refreshToken), null);

const replaySession = await createAuthSession(redis, userId);
const replayRotation = await rotateAuthSession(redis, replaySession.token);
assert.equal(await rotateAuthSession(redis, replaySession.token), null);
assert.equal(
  await rotateAuthSession(redis, replayRotation.refreshToken),
  null,
);

console.log('auth session validation passed');
