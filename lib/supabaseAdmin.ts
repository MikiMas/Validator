import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdminClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
} else {
  console.warn(
    "Supabase admin client not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment."
  );
}

export function getSupabaseAdminClient() {
  if (!supabaseAdminClient) {
    throw new Error("Supabase admin client is not configured.");
  }
  return supabaseAdminClient;
}

export const supabaseAdmin = supabaseAdminClient;
