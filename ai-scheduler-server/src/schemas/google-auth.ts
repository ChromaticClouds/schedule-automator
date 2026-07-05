import { z } from 'zod';

const pkceValue = z.string().regex(/^[A-Za-z0-9_-]{43,128}$/);
const opaqueToken = z.string().regex(/^[A-Za-z0-9_.-]{32,256}$/);

export const googleStartQuerySchema = z.object({
  codeChallenge: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  returnTo: z.url().optional(),
});

export const googleCallbackQuerySchema = z
  .object({
    code: z.string().trim().min(1).optional(),
    error: z.string().trim().min(1).optional(),
    state: z.string().trim().min(1),
  })
  .refine((query) => query.code || query.error, {
    message: 'Google callback requires code or error',
  });

export const sessionExchangeSchema = z.object({
  code: opaqueToken,
  codeVerifier: pkceValue,
});

export const refreshSessionSchema = z.object({
  refreshToken: opaqueToken,
});
