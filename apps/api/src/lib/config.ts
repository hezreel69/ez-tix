import "dotenv/config";
import { z } from "zod";

/**
 * Environment configuration validated at boot using Zod.
 * Source: TRD Section 16.3
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default(
      "postgresql://eztix:eztix_dev_password@localhost:5432/eztix?schema=public",
    ),
  DIRECT_URL: z
    .string()
    .min(1)
    .default(
      "postgresql://eztix:eztix_dev_password@localhost:5432/eztix?schema=public",
    ),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  JWT_ACCESS_SECRET: z
    .string()
    .min(16)
    .default("dev-only-jwt-access-secret-do-not-use-in-prod"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16)
    .default("dev-only-jwt-refresh-secret-do-not-use-in-prod"),
  JWT_SOCKET_SECRET: z
    .string()
    .min(16)
    .default("dev-only-jwt-socket-secret-do-not-use-in-prod"),
  PASS_SECRET: z
    .string()
    .min(16)
    .default("dev-only-purchase-pass-secret-do-not-use-in-prod"),
  WEBHOOK_SECRET: z
    .string()
    .min(16)
    .default("dev-only-webhook-hmac-secret-do-not-use-in-prod"),
  TICKET_QR_SECRET: z
    .string()
    .min(16)
    .default("dev-only-ticket-qr-secret-do-not-use-in-prod"),
  TURNSTILE_SECRET: z.string().optional().default(""),
  RESEND_API_KEY: z.string().optional().default(""),
  EMAIL_FROM: z.string().default("no-reply@eztix.local"),
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().int().default(1025),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
  SENTRY_DSN: z.string().optional().default(""),
});

export type AppConfig = z.infer<typeof envSchema>;

function loadConfig(): AppConfig {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "Invalid environment configuration:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment configuration");
  }
  return parsed.data;
}

export const config = loadConfig();
