import { NextResponse } from "next/server";
import { createClient } from "@/server/supabase/server";
import { sameOrigin } from "@/server/abuse/turnstile";
import { isMediaKey, keyBelongsTo, r2Config, signUpload } from "@/server/storage/r2";
import { capturableUrl, captureScreenshot } from "@/server/cover/capture";

// Auto cover: only for the signed-in owner's own PUBLIC project that has no cover yet. Any failure leaves the generated fallback cover.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ ok: false, reason: "origin" }, { status: 403 });
  const cfg = r2Config();
  if (!cfg) return NextResponse.json({ ok: false, reason: "storage" }, { status: 503 });
  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, reason: "auth" }, { status: 401 });
    const { slug } = await request.json();
    if (typeof slug !== "string" || slug.length > 80) return NextResponse.json({ ok: false, reason: "input" }, { status: 400 });
    const { data: p } = await sb.from("projects").select("id, owner_id, visibility, live_url, cover_url").eq("slug", slug).eq("owner_id", user.id).maybeSingle();
    if (!p) return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
    if (p.visibility !== "public") return NextResponse.json({ ok: false, reason: "not_public" }, { status: 200 });
    if (p.cover_url) return NextResponse.json({ ok: false, reason: "has_cover" }, { status: 200 });
    const target = capturableUrl(p.live_url ?? "");
    if (!target) return NextResponse.json({ ok: false, reason: "bad_url" }, { status: 200 });
    const shot = await captureScreenshot(target);
    const { data: paths, error } = await sb.rpc("reserve_media_slots", { amount: 1 });
    if (error || !Array.isArray(paths) || paths.length !== 1 || !isMediaKey(paths[0]) || !keyBelongsTo(paths[0], user.id)) return NextResponse.json({ ok: false, reason: "quota" }, { status: 200 });
    const up = signUpload(cfg, paths[0], shot.type, shot.bytes.length);
    const put = await fetch(up.uploadUrl, { method: "PUT", headers: up.headers, body: shot.bytes as BodyInit, signal: AbortSignal.timeout(20000) });
    if (!put.ok) return NextResponse.json({ ok: false, reason: "upload" }, { status: 200 });
    const { error: saveError } = await sb.from("projects").update({ cover_url: up.publicUrl }).eq("id", p.id).eq("owner_id", user.id).is("cover_url", null);
    if (saveError) return NextResponse.json({ ok: false, reason: "save" }, { status: 200 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: false, reason: "capture_failed" }, { status: 200 }); }
}
