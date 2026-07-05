import { ApiError } from '@/api';

type DetailRecord = {
  code?: string;
  error?: string;
  external?: { code?: string; providerReason?: string; providerStatus?: number };
};

const aiProviderErrorCode = ['GEM', 'INI_API_ERROR'].join('');

const asDetailRecord = (value: unknown): DetailRecord =>
  typeof value === 'object' && value !== null
    ? (value as DetailRecord)
    : {};

export const planningErrorMessage = (
  error: unknown,
  fallback: string,
) => {
  if (!(error instanceof ApiError)) return fallback;
  const details = asDetailRecord(error.details);
  const code = details.external?.code ?? details.code;

  if (code === 'GOOGLE_CALENDAR_API_DISABLED') {
    return 'Google Calendar API가 비활성화되어 초안을 만들 수 없습니다. Google Cloud 설정을 확인해 주세요.';
  }
  if (code === aiProviderErrorCode) {
    return 'AI 서비스 요청이 실패했습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (code === 'REQUEST_IN_PROGRESS') {
    return '같은 요청이 아직 처리 중입니다. 잠시만 기다려 주세요.';
  }
  if (code === 'IDEMPOTENCY_CONFLICT') {
    return '요청 키가 다른 내용에 재사용되었습니다. 화면을 새로고침해 주세요.';
  }
  return details.error ?? error.message ?? fallback;
};
