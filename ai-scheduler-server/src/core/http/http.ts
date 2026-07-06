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

export const parseQuery = <T>(
  schema: z.ZodType<T>,
  request: FastifyRequest,
) => {
  const result = schema.safeParse(request.query);

  if (!result.success) {
    throw new HttpError('Invalid query parameters', 400, result.error.flatten());
  }

  return result.data;
};

export const requireUserId = (request: FastifyRequest) => {
  if (
    request.user.type !== 'access' ||
    !Types.ObjectId.isValid(request.user.sub)
  ) {
    throw new HttpError('Valid access token is required', 401);
  }

  return new Types.ObjectId(request.user.sub);
};

export const notFound = (resource: string) => {
  throw new HttpError(`${resource} not found`, 404);
};
