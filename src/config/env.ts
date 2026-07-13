import dotenv from 'dotenv';

dotenv.config({ override: true });

const parseList = (value?: string) =>
  value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean) || [];

export const env = {
  port: Number(process.env.PORT || 5000),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'development-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  allowedOrigin: process.env.ALLOWED_ORIGIN || '',
  allowedOrigins: parseList(process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || ''),
};
