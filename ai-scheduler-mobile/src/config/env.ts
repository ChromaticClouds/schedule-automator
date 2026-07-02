import { z } from 'zod';

const booleanFromEnv = (defaultValue: boolean) =>
  z
    .string()
    .optional()
    .transform((value) =>
      value === undefined ? defaultValue : value === 'true',
    );

const numberFromEnv = (defaultValue: number) =>
  z.coerce.number().int().nonnegative().default(defaultValue);

const envSchema = z.object({
  EXPO_PUBLIC_APP_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  EXPO_PUBLIC_APP_NAME: z.string().min(1).default('AI Scheduler'),
  EXPO_PUBLIC_APP_SCHEME: z.string().min(1).default('aischedulermobile'),
  EXPO_PUBLIC_API_BASE_URL: z.url(),
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: z.string().default(''),
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: z.string().default(''),
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: z.string().default(''),
  EXPO_PUBLIC_AI_CALENDAR_NAME: z.string().min(1).default('AI Schedule'),
  EXPO_PUBLIC_AI_EVENT_PREFIX: z.string().min(1).default('[AI]'),
  EXPO_PUBLIC_DEFAULT_TIMEZONE: z.string().min(1).default('Asia/Seoul'),
  EXPO_PUBLIC_WAKE_OFFSET_MINUTES: numberFromEnv(10),
  EXPO_PUBLIC_MAX_DAILY_WORK_MINUTES: numberFromEnv(480),
  EXPO_PUBLIC_ENABLE_MOCK_AUTH: booleanFromEnv(true),
  EXPO_PUBLIC_ENABLE_MOCK_CALENDAR: booleanFromEnv(true),
  EXPO_PUBLIC_ENABLE_DEV_TOOLS: booleanFromEnv(true),
});

const parsedEnv = envSchema.parse({
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_APP_NAME: process.env.EXPO_PUBLIC_APP_NAME,
  EXPO_PUBLIC_APP_SCHEME: process.env.EXPO_PUBLIC_APP_SCHEME,
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID:
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  EXPO_PUBLIC_AI_CALENDAR_NAME: process.env.EXPO_PUBLIC_AI_CALENDAR_NAME,
  EXPO_PUBLIC_AI_EVENT_PREFIX: process.env.EXPO_PUBLIC_AI_EVENT_PREFIX,
  EXPO_PUBLIC_DEFAULT_TIMEZONE: process.env.EXPO_PUBLIC_DEFAULT_TIMEZONE,
  EXPO_PUBLIC_WAKE_OFFSET_MINUTES:
    process.env.EXPO_PUBLIC_WAKE_OFFSET_MINUTES,
  EXPO_PUBLIC_MAX_DAILY_WORK_MINUTES:
    process.env.EXPO_PUBLIC_MAX_DAILY_WORK_MINUTES,
  EXPO_PUBLIC_ENABLE_MOCK_AUTH: process.env.EXPO_PUBLIC_ENABLE_MOCK_AUTH,
  EXPO_PUBLIC_ENABLE_MOCK_CALENDAR:
    process.env.EXPO_PUBLIC_ENABLE_MOCK_CALENDAR,
  EXPO_PUBLIC_ENABLE_DEV_TOOLS: process.env.EXPO_PUBLIC_ENABLE_DEV_TOOLS,
});

export const ENV = {
  APP_ENV: parsedEnv.EXPO_PUBLIC_APP_ENV,
  APP_NAME: parsedEnv.EXPO_PUBLIC_APP_NAME,
  APP_SCHEME: parsedEnv.EXPO_PUBLIC_APP_SCHEME,
  API_BASE_URL: parsedEnv.EXPO_PUBLIC_API_BASE_URL.replace(/\/$/, ''),
  GOOGLE_ANDROID_CLIENT_ID: parsedEnv.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID: parsedEnv.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID: parsedEnv.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  AI_CALENDAR_NAME: parsedEnv.EXPO_PUBLIC_AI_CALENDAR_NAME,
  AI_EVENT_PREFIX: parsedEnv.EXPO_PUBLIC_AI_EVENT_PREFIX,
  DEFAULT_TIMEZONE: parsedEnv.EXPO_PUBLIC_DEFAULT_TIMEZONE,
  WAKE_OFFSET_MINUTES: parsedEnv.EXPO_PUBLIC_WAKE_OFFSET_MINUTES,
  MAX_DAILY_WORK_MINUTES: parsedEnv.EXPO_PUBLIC_MAX_DAILY_WORK_MINUTES,
  ENABLE_MOCK_AUTH: parsedEnv.EXPO_PUBLIC_ENABLE_MOCK_AUTH,
  ENABLE_MOCK_CALENDAR: parsedEnv.EXPO_PUBLIC_ENABLE_MOCK_CALENDAR,
  ENABLE_DEV_TOOLS: parsedEnv.EXPO_PUBLIC_ENABLE_DEV_TOOLS,
} as const;
