import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeReturnPath } from "@/lib/safe-url";

// Keep the exchange and its cookies on one response. Do not refresh an old
// session in the proxy while the new OAuth session is being established.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const dest = safeReturnPath(searchParams.get("next"), origin);
  const response = NextResponse.redirect(`${origin}${dest}`, 303);
  response.headers.set("Cache-Control", "private, no-store");
  const code = searchParams.get("code");
  if (code) {
    const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: list => list.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    });
    const { data, error } = await sb.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      if (data.session.user.app_metadata.provider === "github") response.headers.set("Location", `${origin}/api/github/connect?next=${encodeURIComponent(dest)}`);
      return response;
    }
    // Codes are single use. A duplicated callback must not strand a session
    // which was successfully established by the first callback.
    const existing = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} },
    });
    const { data: before } = await existing.auth.getUser();
    if (before.user) {
      const duplicate = NextResponse.redirect(`${origin}${dest}`, 303);
      duplicate.headers.set("Cache-Control", "private, no-store");
      return duplicate;
    }
  }
  const failed = new URL("/login", origin);
  failed.searchParams.set("error", "auth");
  failed.searchParams.set("next", dest);
  response.headers.set("Location", failed.href);
  return response;
}
