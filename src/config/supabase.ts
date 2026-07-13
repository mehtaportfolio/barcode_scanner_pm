import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabaseUrl = env.supabaseUrl;
const supabaseServiceRoleKey = env.supabaseServiceRoleKey;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Supabase credentials are not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'
  );
}

console.log("Supabase URL:", supabaseUrl);
console.log("Service Key Prefix:", supabaseServiceRoleKey.substring(0, 30));
console.log("Service Key Length:", supabaseServiceRoleKey.length);

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);