import "server-only";
import { cache } from "react";
import { createClient, getAuthUser } from "@/server/supabase/server";
export type AdminRole = "owner" | "admin" | "moderator";
// Admin access is decided in the database. A pending invite is claimed only when the signed-in account's verified Google or GitHub email matches it.
export const adminAccess = cache(async function adminAccess() {
  const sb = await createClient();
  const { data: { user } } = await getAuthUser();
  if (!user) return { sb, user: null, allowed: false, role: null as AdminRole | null };
  const first = await sb.rpc("admin_role"); const error = first.error; let role = first.data as string | null;
  if (!error && !role) { const claimed = await sb.rpc("claim_admin_invite"); role = claimed.error ? null : (claimed.data as string | null); }
  const ok = !error && (role === "owner" || role === "admin" || role === "moderator");
  return { sb, user, allowed: ok, role: ok ? (role as AdminRole) : null };
});
