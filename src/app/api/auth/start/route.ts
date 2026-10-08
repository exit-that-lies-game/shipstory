import { NextResponse } from "next/server";
import { createClient } from "@/server/supabase/server";
import { safeReturnPath } from "@/shared/safe-url";
import { sameOrigin, verifyTurnstile } from "@/server/abuse/turnstile";

export async function POST(request: Request) {
  if (!sameOrigin(request)) { console.warn("auth/start origin mismatch", { origin: request.headers.get("origin"), url: new URL(request.url).origin }); return NextResponse.json({ error: "Invalid request." }, { status: 403 }); }
  try {
    const { token, provider, next } = await request.json();
    const url = new URL(request.url);
    if (provider !== "github" && provider !== "google") return NextResponse.json({ error: "Choose Google or GitHub." }, { status: 400 });
    if (!await verifyTurnstile(token, "login", url.hostname)) return NextResponse.json({ error: "Verification did not complete. Please try again." }, { status: 403 });
    const sb = await createClient();
    const { data, error } = await sb.auth.signInWithOAuth({ provider, options: {
      scopes: provider === "github" ? "read:user user:email" : undefined,
      redirectTo: `${url.origin}/auth/callback?provider=${provider}&next=${encodeURIComponent(safeReturnPath(next, url.origin))}`, skipBrowserRedirect: true,
    } });
    if (error || !data.url) return NextResponse.json({ error: "Sign-in could not start. Please try again." }, { status: 502 });
    return NextResponse.json({ url: data.url });
  } catch { return NextResponse.json({ error: "Could not start sign-in. Please try again." }, { status: 400 }); }
}
