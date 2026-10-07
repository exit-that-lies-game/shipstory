import "server-only";
import { cache } from "react";
import { createClient, getAuthUser } from "@/lib/supabase/server";
export const adminAccess = cache(async function adminAccess() {
  const sb = await createClient();
  const { data: { user } } = await getAuthUser();
  if (!user) return { sb, user: null, allowed: false };
  const { data, error } = await sb.rpc("is_admin");
  return { sb, user, allowed: !error && data === true };
});
