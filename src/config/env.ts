import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
  override: true,
});

const parseList = (value?: string) =>
  value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean) || [];

const isProduction = (process.env.NODE_ENV || 'development').toLowerCase() === 'production';
const defaultAllowedOrigins = [
  'http://localhost:8081',
  'http://localhost:19006',
  'http://127.0.0.1:8081',
  'http://127.0.0.1:19006',
  'http://localhost:3000',
];

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production.');
}

if (isProduction && (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in production.');
}

export const env = {
  port: Number(process.env.PORT || 5000),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'development-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  allowedOrigin: process.env.ALLOWED_ORIGIN || '',
  allowedOrigins: parseList(process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || defaultAllowedOrigins.join(',')),
};
