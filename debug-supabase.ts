import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log("URL:", process.env.SUPABASE_URL);
console.log("Key Length:", key.length);
console.log("Starts With:", key.substring(0, 20));

const payload = JSON.parse(
  Buffer.from(key.split(".")[1], "base64").toString("utf8")
);

console.log("JWT ref:", payload.ref);
console.log("Raw Key:", process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  key
);

async function test() {
  const { data, error } = await supabase
    .from("containers")
    .select("*")
    .limit(1);

  console.log("Data:", data);
  console.log("Error:", error);
}

test();