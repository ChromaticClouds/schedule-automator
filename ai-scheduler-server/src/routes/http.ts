import type { FastifyRequest } from 'fastify';
import { Types } from 'mongoose';
import type { z } from 'zod';

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const parseBody = <T>(schema: z.ZodType<T>, request: FastifyRequest) => {
  const result = schema.safeParse(request.body);

  if (!result.success) {
    throw new HttpError('Invalid request body', 400, result.error.flatten());
  }

  return result.data;
};

export const parseParams = <T>(
  schema: z.ZodType<T>,
  request: FastifyRequest,
) => {
  const result = schema.safeParse(request.params);

  if (!result.success) {
    throw new HttpError('Invalid route params', 400, result.error.flatten());
  }

  return result.data;
};

export const requireUserId = (request: FastifyRequest) => {
  const raw = request.headers['x-user-id'];
  const userId = Array.isArray(raw) ? raw[0] : raw;

  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new HttpError('Valid x-user-id header is required', 401);
  }

  return new Types.ObjectId(userId);
};

export const notFound = (resource: string) => {
  throw new HttpError(`${resource} not found`, 404);
};
