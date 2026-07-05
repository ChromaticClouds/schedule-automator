import { scheduleIdempotencyKeySchema } from '@/schemas/schedule-draft.js';
import {
  ScheduleApprovalError,
} from '@/services/schedule-approval.js';
import { ScheduleDraftError } from '@/services/schedule-draft.js';
import { ScheduleEditError } from '@/services/schedule-edit.js';
import { ScheduleLifecycleError } from '@/services/schedule-lifecycle.js';
import { ScheduleRegenerateError } from '@/services/schedule-regenerate.js';
import { GoogleConnectionError } from '@/services/google-client.js';
import { HttpError } from './http.js';

type RequestWithHeaders = { headers: Record<string, unknown> };

export const requireIdempotencyKey = (request: RequestWithHeaders) => {
  const key = scheduleIdempotencyKeySchema.safeParse(
    request.headers['idempotency-key'],
  );
  if (!key.success) {
    throw new HttpError('Valid Idempotency-Key header is required', 400);
  }
  return key.data;
};

export const mapScheduleError = (error: unknown): never => {
  if (
    error instanceof ScheduleDraftError ||
    error instanceof ScheduleEditError ||
    error instanceof ScheduleApprovalError ||
    error instanceof ScheduleLifecycleError ||
    error instanceof ScheduleRegenerateError
  ) {
    const external = 'details' in error ? error.details : undefined;
    throw new HttpError(error.message, error.statusCode, {
      code: error.code,
      external,
    });
  }
  if (error instanceof GoogleConnectionError) {
    throw new HttpError(error.message, error.statusCode, { code: error.code });
  }
  throw error;
};
