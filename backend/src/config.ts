import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: Number(process.env.PORT ?? 8081),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/nokta_academy',
  jwtSecret: process.env.JWT_SECRET ?? 'secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  refreshSecret: process.env.REFRESH_SECRET ?? 'refresh-secret',
  refreshExpiresIn: process.env.REFRESH_EXPIRES_IN ?? '7d',
  rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW ?? 15),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 120)
};
