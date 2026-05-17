import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const environment = process.env.NODE_ENV ?? 'development';
const baseRateLimitMax = Number(process.env.RATE_LIMIT_MAX ?? 120);

function requireProductionSecret(name: string, fallback: string, minimumLength = 32) {
  const value = process.env[name] ?? fallback;

  if (environment === 'production' && (!process.env[name] || value === fallback || value.length < minimumLength)) {
    throw new Error(`${name} must be set to a strong value of at least ${minimumLength} characters in production.`);
  }

  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 8081),
  baseUrl: process.env.BASE_URL ?? 'http://localhost:8081',
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/nokta_academy',
  jwtSecret: requireProductionSecret('JWT_SECRET', 'development-jwt-secret-change-before-production'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  refreshSecret: requireProductionSecret('REFRESH_SECRET', 'development-refresh-secret-change-before-production'),
  refreshExpiresIn: process.env.REFRESH_EXPIRES_IN ?? '7d',
  rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW ?? 15),
  rateLimitMax: baseRateLimitMax,
  readRateLimitMax: Number(process.env.READ_RATE_LIMIT_MAX ?? Math.max(baseRateLimitMax * 20, 1500)),
  writeRateLimitMax: Number(process.env.WRITE_RATE_LIMIT_MAX ?? Math.max(baseRateLimitMax * 4, 240)),
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 10),
  passwordResetExpiresMinutes: Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES ?? 30),
  emailVerificationExpiresHours: Number(process.env.EMAIL_VERIFICATION_EXPIRES_HOURS ?? 24),
  phoneVerificationExpiresMinutes: Number(process.env.PHONE_VERIFICATION_EXPIRES_MINUTES ?? 10),
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
  enableJobs: process.env.ENABLE_JOBS !== 'false',
  defaultBranchCode: process.env.DEFAULT_BRANCH_CODE ?? 'HQ',
  csrfHeaderName: process.env.CSRF_HEADER_NAME ?? 'x-csrf-token',
  csrfSecret: requireProductionSecret('CSRF_SECRET', 'development-csrf-secret-change-before-production'),
  bodyLimit: process.env.BODY_LIMIT ?? '10mb',
  environment
};
