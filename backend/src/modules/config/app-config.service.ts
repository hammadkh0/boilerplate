import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CountryCode } from 'libphonenumber-js';

import { ENVIRONMENTS } from '../shared/constants';
import type { Env } from './env.schema';

/**
 * Typed access to validated env.
 * Callers outside `config/` use this service and do not read `process.env`.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  get nodeEnv(): Env['NODE_ENV'] {
    return this.config.get('NODE_ENV', { infer: true });
  }

  get isProduction(): boolean {
    return this.nodeEnv === ENVIRONMENTS.PRODUCTION;
  }

  get port(): number {
    return this.config.get('PORT', { infer: true });
  }

  get databaseUrl(): string {
    return this.config.get('DATABASE_URL', { infer: true });
  }

  get corsOrigins(): string[] {
    return this.config
      .get('CORS_ORIGINS', { infer: true })
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);
  }

  get frontendUrl(): string {
    return this.config.get('FRONTEND_URL', { infer: true });
  }

  get jwtAccessSecret(): string {
    return this.config.get('JWT_ACCESS_SECRET', { infer: true });
  }

  get jwtRefreshSecret(): string {
    return this.config.get('JWT_REFRESH_SECRET', { infer: true });
  }

  get jwtAccessTtlSeconds(): number {
    return this.config.get('JWT_ACCESS_TTL_SECONDS', { infer: true });
  }

  get jwtRefreshTtlSeconds(): number {
    return this.config.get('JWT_REFRESH_TTL_SECONDS', { infer: true });
  }

  get swaggerEnabled(): boolean {
    return this.config.get('SWAGGER_ENABLED', { infer: true }) === 'true';
  }

  get s3Enabled(): boolean {
    return this.config.get('S3_ENABLED', { infer: true }) === 'true';
  }

  get httpRequestLogEnabled(): boolean {
    return this.config.get('HTTP_REQUEST_LOG_ENABLED', { infer: true }) === 'true';
  }

  get trustProxy(): boolean {
    return this.config.get('TRUST_PROXY', { infer: true }) === 'true';
  }

  get rateLimitEnabled(): boolean {
    return this.config.get('RATE_LIMIT_ENABLED', { infer: true }) === 'true';
  }

  get appName(): string {
    return this.config.get('APP_NAME', { infer: true });
  }

  get emailTransport(): Env['EMAIL_TRANSPORT'] {
    return this.config.get('EMAIL_TRANSPORT', { infer: true });
  }

  /** Host and port for `EMAIL_TRANSPORT=smtp`. Throws when either is missing. */
  get smtp(): { host: string; port: number } {
    const host = this.config.get('SMTP_HOST', { infer: true });
    const port = this.config.get('SMTP_PORT', { infer: true });
    if (!host || !port) {
      throw new Error('SMTP_HOST and SMTP_PORT are required');
    }
    return { host, port };
  }

  get emailFrom(): string {
    const value = this.config.get('EMAIL_FROM', { infer: true });
    if (!value) {
      throw new Error('EMAIL_FROM is required');
    }
    return value;
  }

  get resendApiKey(): string {
    const value = this.config.get('RESEND_API_KEY', { infer: true });
    if (!value) {
      throw new Error('RESEND_API_KEY is required');
    }
    return value;
  }

  get seedAdminEmail(): string | undefined {
    return this.readBlankable('SEED_ADMIN_EMAIL');
  }

  get seedAdminPassword(): string | undefined {
    return this.readBlankable('SEED_ADMIN_PASSWORD');
  }

  get seedAdminName(): string | undefined {
    return this.readBlankable('SEED_ADMIN_NAME');
  }

  get phoneDefaultRegion(): CountryCode {
    return this.config.get('PHONE_DEFAULT_REGION', { infer: true }).toUpperCase() as CountryCode;
  }

  get s3Region(): string | undefined {
    return this.readOptional('S3_REGION');
  }

  get s3Bucket(): string | undefined {
    return this.readOptional('S3_BUCKET');
  }

  get s3AccessKeyId(): string | undefined {
    return this.readOptional('S3_ACCESS_KEY_ID');
  }

  get s3SecretAccessKey(): string | undefined {
    return this.readOptional('S3_SECRET_ACCESS_KEY');
  }

  private readBlankable(
    key: 'SEED_ADMIN_EMAIL' | 'SEED_ADMIN_PASSWORD' | 'SEED_ADMIN_NAME',
  ): string | undefined {
    const value = this.config.get(key, { infer: true });
    return value && value.length > 0 ? value : undefined;
  }

  private readOptional(
    key: 'S3_REGION' | 'S3_BUCKET' | 'S3_ACCESS_KEY_ID' | 'S3_SECRET_ACCESS_KEY',
  ): string | undefined {
    const value = this.config.get(key, { infer: true });
    return value && value.length > 0 ? value : undefined;
  }
}
