export const E2E_PORTS = { FRONTEND: 4000, BACKEND: 4001 } as const;

export const FRONTEND_URL = `http://localhost:${E2E_PORTS.FRONTEND}`;

export const BACKEND_URL = `http://localhost:${E2E_PORTS.BACKEND}`;

export const MAILPIT_URL = 'http://localhost:8025';

export const E2E_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/boilerplate_e2e';

export const E2E_ADMIN = {
  EMAIL: 'admin@e2e.test',
  PASSWORD: 'E2eAdmin1',
  NAME: 'E2E Admin',
} as const;

export const E2E_PASSWORD = 'E2ePassw0rd';

export const E2E_NEW_PASSWORD = 'E2ePassw0rd2';

export const BACKEND_ENV = {
  NODE_ENV: 'development',
  PORT: String(E2E_PORTS.BACKEND),
  DATABASE_URL: E2E_DATABASE_URL,
  CORS_ORIGINS: FRONTEND_URL,
  FRONTEND_URL,
  JWT_ACCESS_SECRET: 'e2e-access-secret-local-only-000000000000',
  JWT_REFRESH_SECRET: 'e2e-refresh-secret-local-only-00000000000',
  JWT_ACCESS_TTL_SECONDS: '900',
  JWT_REFRESH_TTL_SECONDS: '2592000',
  SWAGGER_ENABLED: 'false',
  S3_ENABLED: 'false',
  HTTP_REQUEST_LOG_ENABLED: 'false',
  TRUST_PROXY: 'false',
  RATE_LIMIT_ENABLED: 'false',
  PHONE_DEFAULT_REGION: 'US',
  APP_NAME: 'Acme',
  EMAIL_TRANSPORT: 'smtp',
  EMAIL_FROM: 'Acme <noreply@e2e.test>',
  SMTP_HOST: 'localhost',
  SMTP_PORT: '1025',
  SEED_ADMIN_EMAIL: E2E_ADMIN.EMAIL,
  SEED_ADMIN_PASSWORD: E2E_ADMIN.PASSWORD,
  SEED_ADMIN_NAME: E2E_ADMIN.NAME,
} as const;
