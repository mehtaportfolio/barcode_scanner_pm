import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabaseUrl = env.supabaseUrl;
const supabaseServiceRoleKey = env.supabaseServiceRoleKey;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Supabase credentials are not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'
  );
}



export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);