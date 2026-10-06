import { createClient, supabaseConfigured } from "../supabase/client";

export async function currentUserId(): Promise<string | null> {
  if (!supabaseConfigured) return null;
  const { data } = await createClient().auth.getUser();
  return data.user?.id ?? null;
}
