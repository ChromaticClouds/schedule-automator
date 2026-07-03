import { z } from 'zod';

export const googleCallbackQuerySchema = z
  .object({
    code: z.string().trim().min(1).optional(),
    error: z.string().trim().min(1).optional(),
    state: z.string().trim().min(1),
  })
  .refine((query) => query.code || query.error, {
    message: 'Google callback requires code or error',
  });
