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

// A suspended account stays signed in. The app shows a banner, and the database blocks posting (projects, updates, comments, uploads)
// because suspending also sets posting_blocked. The suspended flag is set by an admin and cannot be changed by the user.
export const getAuthUser = cache(async () => {
  const sb = await createClient();
  return sb.auth.getUser();
});
