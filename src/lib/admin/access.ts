import "server-only";
import { createClient } from "@/lib/supabase/server";
export async function adminAccess() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { sb, user: null, allowed: false };
  const { data, error } = await sb.rpc("is_admin");
  return { sb, user, allowed: !error && data === true };
}
