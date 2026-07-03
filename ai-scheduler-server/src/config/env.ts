import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),

  SERVER_BASE_URL: z.url(),
  APP_ORIGIN: z.string().min(1),
  CORS_ORIGIN: z.string().min(1),

  MONGO_URL: z.string().min(1),

  JWT_SECRET: z.string().min(32),
  SESSION_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),
  REFRESH_TOKEN_PEPPER: z.string().min(32),
  JWT_ISSUER: z.string().min(1).default("ai-scheduler-server"),
  JWT_AUDIENCE: z.string().min(1).default("ai-scheduler-mobile"),
  JWT_ACCESS_TTL_SECONDS: z.coerce
    .number()
    .int()
    .min(60)
    .max(3600)
    .default(900),
  AUTH_REFRESH_TTL_SECONDS: z.coerce
    .number()
    .int()
    .min(3600)
    .max(7776000)
    .default(2592000),
  AUTH_HANDOFF_TTL_SECONDS: z.coerce
    .number()
    .int()
    .min(30)
    .max(300)
    .default(60),

  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash"),
  GEMINI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.2),
  GEMINI_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(8192),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.url(),

  GOOGLE_CALENDAR_SCOPES: z.string().min(1),
  GOOGLE_CALENDAR_AI_NAME: z.string().min(1).default("AI Schedule"),
  GOOGLE_CALENDAR_EVENT_PREFIX: z.string().min(1).default("[AI]"),

  APP_TIMEZONE: z.string().min(1).default("Asia/Seoul"),
  WAKE_OFFSET_MINUTES: z.coerce.number().int().min(0).max(180).default(10),
  MAX_DAILY_WORK_MINUTES: z.coerce.number().int().min(60).max(720).default(480),
  DAILY_PLAN_JOB_ENABLED: z.coerce.boolean().default(true),
  REVIEW_REMINDER_TIME: z.string().default("22:30"),

  REDIS_URL: z.url().refine(
    (value) =>
      value.startsWith("redis://") || value.startsWith("rediss://"),
    "REDIS_URL must use redis:// or rediss://",
  ),
  REDIS_KEY_PREFIX: z.string().min(1).default("ai-scheduler:"),
  QUEUE_NAME: z.string().min(1),

  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("debug"),
  AI_PAYLOAD_LOGGING: z.enum(["on", "off"]).default("off"),
  MASK_SENSITIVE_LOGS: z.coerce.boolean().default(true),
});

export const ENV = envSchema.parse(process.env);

export const CORS_ORIGINS = ENV.CORS_ORIGIN.split(",").map((origin) =>
  origin.trim(),
);
