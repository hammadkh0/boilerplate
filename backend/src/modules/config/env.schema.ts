import { z } from 'zod';

import { EMAIL_TRANSPORT, ENVIRONMENTS } from '../shared/constants';

const REQUIRED_S3_KEYS = [
  'S3_REGION',
  'S3_BUCKET',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
] as const;

/**
 * Validates process env at startup.
 * Secrets have no default. The process exits when a required value is missing or too short.
 * Production refuses the local SMTP transport and a disabled rate limiter.
 */
export const envSchema = z
  .object({
    NODE_ENV: z.enum([ENVIRONMENTS.DEVELOPMENT, ENVIRONMENTS.TEST, ENVIRONMENTS.PRODUCTION]),
    PORT: z.coerce.number().int().min(1).max(65535),
    DATABASE_URL: z.string().min(1),
    CORS_ORIGINS: z.string().min(1),
    FRONTEND_URL: z.url(),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive(),
    JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive(),
    SWAGGER_ENABLED: z.enum(['true', 'false']),
    S3_ENABLED: z.enum(['true', 'false']),
    HTTP_REQUEST_LOG_ENABLED: z.enum(['true', 'false']),
    TRUST_PROXY: z.enum(['true', 'false']),
    RATE_LIMIT_ENABLED: z.enum(['true', 'false']),
    PHONE_DEFAULT_REGION: z.string().length(2),
    APP_NAME: z.string().min(1).default('Acme'),
    EMAIL_TRANSPORT: z.enum([EMAIL_TRANSPORT.RESEND, EMAIL_TRANSPORT.SMTP]),
    EMAIL_FROM: z.string().min(1).optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).optional(),
    SEED_ADMIN_EMAIL: z.string().optional(),
    SEED_ADMIN_PASSWORD: z.string().optional(),
    SEED_ADMIN_NAME: z.string().max(120).optional(),
    S3_REGION: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV === ENVIRONMENTS.PRODUCTION) {
      if (value.EMAIL_TRANSPORT === EMAIL_TRANSPORT.SMTP) {
        ctx.addIssue({
          code: 'custom',
          path: ['EMAIL_TRANSPORT'],
          message: 'EMAIL_TRANSPORT=smtp is for local inboxes and is not allowed in production',
        });
      }
      if (value.RATE_LIMIT_ENABLED !== 'true') {
        ctx.addIssue({
          code: 'custom',
          path: ['RATE_LIMIT_ENABLED'],
          message: 'RATE_LIMIT_ENABLED must be true in production',
        });
      }
    }

    if (value.NODE_ENV !== ENVIRONMENTS.TEST) {
      if (!value.EMAIL_FROM) {
        ctx.addIssue({
          code: 'custom',
          path: ['EMAIL_FROM'],
          message: 'EMAIL_FROM is required',
        });
      }
      if (value.EMAIL_TRANSPORT === EMAIL_TRANSPORT.RESEND && !value.RESEND_API_KEY) {
        ctx.addIssue({
          code: 'custom',
          path: ['RESEND_API_KEY'],
          message: 'RESEND_API_KEY is required when EMAIL_TRANSPORT is resend',
        });
      }
      if (
        value.EMAIL_TRANSPORT === EMAIL_TRANSPORT.SMTP &&
        (!value.SMTP_HOST || !value.SMTP_PORT)
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['SMTP_HOST'],
          message: 'SMTP_HOST and SMTP_PORT are required when EMAIL_TRANSPORT is smtp',
        });
      }
    }

    if (value.S3_ENABLED !== 'true') {
      return;
    }

    for (const key of REQUIRED_S3_KEYS) {
      if (!value[key]) {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: `${key} is required when S3_ENABLED is true`,
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;
