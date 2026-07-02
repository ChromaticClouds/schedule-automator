import { ENV } from '@/config';

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const buildUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${ENV.API_BASE_URL}${normalizedPath}`;
};

export const apiRequest = async <T>(path: string, options: ApiOptions = {}) => {
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      ...options,
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    throw new ApiError('Network request failed', 0, error);
  }

  const text = await response.text();
  const data = text.length > 0 ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw new ApiError(response.statusText, response.status, data);
  }

  return data as T;
};

export type HealthResponse = {
  ok: boolean;
  service: string;
};

export const getHealth = () => apiRequest<HealthResponse>('/health');
