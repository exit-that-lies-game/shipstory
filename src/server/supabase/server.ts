import { createServerClient } from "@supabase/ssr";
import { cache } from "react";
import { cookies } from "next/headers";

export const createClient = cache(async function createClient() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // called from a Server Component, middleware refreshes the session instead
        }
      },
    },
  });
});

// A suspended account is treated as signed out everywhere. The suspended flag is set by an admin and cannot be changed by the user.
export const getAuthUser = cache(async () => {
  const sb = await createClient();
  const res = await sb.auth.getUser();
  if (!res.data.user) return res;
  const { data } = await sb.from("profiles").select("suspended").eq("id", res.data.user.id).maybeSingle();
  return data?.suspended ? { data: { user: null }, error: null } as unknown as typeof res : res;
});
