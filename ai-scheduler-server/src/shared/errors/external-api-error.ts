export type ExternalApiErrorDetails = {
  code: string;
  message?: string;
  provider: 'gemini' | 'google_calendar';
  providerCode?: string;
  providerReason?: string;
  providerStatus?: number;
};

type AnyRecord = Record<string, unknown>;

const asRecord = (value: unknown): AnyRecord | undefined =>
  typeof value === 'object' && value !== null
    ? (value as AnyRecord)
    : undefined;

const stringField = (record: AnyRecord | undefined, key: string) => {
  const value = record?.[key];
  return typeof value === 'string' ? value : undefined;
};

const numberField = (record: AnyRecord | undefined, key: string) => {
  const value = record?.[key];
  return typeof value === 'number' ? value : undefined;
};

const truncate = (value: string | undefined) =>
  value && value.length > 240 ? `${value.slice(0, 237)}...` : value;

export const classifyGeminiError = (
  error: unknown,
): ExternalApiErrorDetails => {
  const record = asRecord(error);
  const response = asRecord(record?.response);

  return {
    code: 'GEMINI_API_ERROR',
    message: truncate(stringField(record, 'message')),
    provider: 'gemini',
    providerCode: stringField(record, 'code'),
    providerStatus:
      numberField(record, 'status') ??
      numberField(record, 'statusCode') ??
      numberField(response, 'status'),
  };
};

export const classifyGoogleCalendarError = (
  error: unknown,
): ExternalApiErrorDetails | undefined => {
  const record = asRecord(error);
  const response = asRecord(record?.response);
  const data = asRecord(response?.data);
  const bodyError = asRecord(data?.error);
  const status = numberField(bodyError, 'code') ?? numberField(response, 'status');
  const details = Array.isArray(bodyError?.details) ? bodyError.details : [];
  const errorInfo = details.map(asRecord).find((detail) => {
    const metadata = asRecord(detail?.metadata);
    return metadata?.service === 'calendar-json.googleapis.com';
  });
  const errors = Array.isArray(bodyError?.errors) ? bodyError.errors : [];
  const firstError = asRecord(errors[0]);
  const reason =
    stringField(errorInfo, 'reason') ??
    stringField(firstError, 'reason') ??
    stringField(bodyError, 'status');

  if (!status && !reason) return undefined;

  return {
    code:
      reason === 'SERVICE_DISABLED' || reason === 'accessNotConfigured'
        ? 'GOOGLE_CALENDAR_API_DISABLED'
        : 'GOOGLE_CALENDAR_API_ERROR',
    message: truncate(stringField(bodyError, 'message')),
    provider: 'google_calendar',
    providerReason: reason,
    providerStatus: status,
  };
};
