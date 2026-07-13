import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const client = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

async function test() {
  console.log("Testing Supabase...");

  const { data, error } = await client
    .from("containers")
    .select("*")
    .limit(1);

  console.log("DATA:", data);
  console.log("ERROR:", error);
}

test();