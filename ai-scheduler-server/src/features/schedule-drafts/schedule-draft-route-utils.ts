import { scheduleIdempotencyKeySchema } from './schedule-draft.schema.js';
import {
  ScheduleApprovalError,
} from './schedule-approval.js';
import { ScheduleDraftError } from './schedule-draft.js';
import { ScheduleEditError } from './schedule-edit.js';
import { ScheduleLifecycleError } from './schedule-lifecycle.js';
import { ScheduleRegenerateError } from './schedule-regenerate.js';
import { GoogleConnectionError } from '@/integrations/google/google-client.js';
import { HttpError } from '@/routes/http.js';

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
