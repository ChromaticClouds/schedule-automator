import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';
import { z } from 'zod';

const stateSchema = z.object({
  userId: z.string().regex(/^[a-f\d]{24}$/i),
  expiresAt: z.number().int().positive(),
  nonce: z.string().min(16),
});

const deriveKey = (secret: string) =>
  createHash('sha256').update(secret).digest();

const sign = (value: string, secret: string) =>
  createHmac('sha256', secret).update(value).digest('base64url');

export const createOAuthState = (
  userId: string,
  secret: string,
  now = Date.now(),
) => {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      expiresAt: now + 10 * 60 * 1000,
      nonce: randomBytes(18).toString('base64url'),
    }),
  ).toString('base64url');

  return `${payload}.${sign(payload, secret)}`;
};

export const verifyOAuthState = (
  state: string,
  secret: string,
  now = Date.now(),
) => {
  const [payload, signature] = state.split('.');

  if (!payload || !signature) {
    throw new Error('Invalid OAuth state');
  }

  const expected = Buffer.from(sign(payload, secret));
  const received = Buffer.from(signature);

  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    throw new Error('Invalid OAuth state');
  }

  const parsed = stateSchema.parse(
    JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')),
  );

  if (parsed.expiresAt <= now) {
    throw new Error('Expired OAuth state');
  }

  return parsed;
};

export const encryptSecret = (plaintext: string, secret: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', deriveKey(secret), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  return [
    'v1',
    iv.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');
};

export const decryptSecret = (value: string, secret: string) => {
  const [version, iv, tag, encrypted] = value.split('.');

  if (version !== 'v1' || !iv || !tag || !encrypted) {
    throw new Error('Invalid encrypted value');
  }

  const decipher = createDecipheriv(
    'aes-256-gcm',
    deriveKey(secret),
    Buffer.from(iv, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
};
