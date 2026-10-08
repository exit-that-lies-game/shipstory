import { NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { createClient } from "@/server/supabase/server";
import { sameOrigin, verifyTurnstile } from "@/server/abuse/turnstile";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    const { data: claims } = await sb.auth.getClaims();
    const sessionId = claims?.claims.session_id;
    if (!user || typeof sessionId !== "string") return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    const { token } = await request.json();
    if (!await verifyTurnstile(token, "write", new URL(request.url).hostname)) return NextResponse.json({ error: "Verification did not complete. Please try again." }, { status: 403 });
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!key) return NextResponse.json({ error: "Verification is unavailable. Please try again later." }, { status: 503 });
    const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await admin.rpc("grant_verified_session", { uid: user.id, sid: sessionId });
    if (error) return NextResponse.json({ error: "Verification could not be saved. Please try again." }, { status: 503 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Verification did not complete. Please try again." }, { status: 400 }); }
}
