import { getSupabaseAdminClient } from "./supabaseAdmin";

/**
 * Extracts the bearer token from the request and validates it against Supabase.
 * Returns the authenticated user or null if not authenticated.
 */
export async function getUserFromRequest(req: Request) {
  const authHeader =
    req.headers.get("authorization") ||
    req.headers.get("Authorization") ||
    req.headers.get("x-supabase-auth");

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : authHeader?.trim();

  if (!token) {
    return null;
  }

  const supabaseAdmin = getSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return data.user;
}
