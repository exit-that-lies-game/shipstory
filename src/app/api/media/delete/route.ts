import { NextResponse } from "next/server";
import { createClient } from "@/server/supabase/server";
import { sameOrigin } from "@/server/abuse/turnstile";
import { deleteObject, isMediaKey, keyBelongsTo, publicUrl, r2Config } from "@/server/storage/r2";

// Owner-only cleanup, for example after a failed publish. Only paths reserved by this user can be deleted.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  const cfg = r2Config();
  if (!cfg) return NextResponse.json({ error: "Image storage is not set up yet." }, { status: 503 });
  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    const paths: unknown = (await request.json())?.paths;
    if (!Array.isArray(paths) || paths.length < 1 || paths.length > 7 || !paths.every((p) => isMediaKey(p) && keyBelongsTo(p, user.id))) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    const { data: owned } = await sb.from("media_slots").select("path").in("path", paths);
    const mine = new Set((owned ?? []).map((r: { path: string }) => r.path));
    // Never delete an image that one of the user's projects still uses (this route is only for cleanup after a failed publish).
    const { data: projs } = await sb.from("projects").select("cover_url, screenshots").eq("owner_id", user.id);
    const used = new Set((projs ?? []).flatMap((r: { cover_url: string | null; screenshots: string[] | null }) => [r.cover_url, ...(r.screenshots ?? [])]));
    const results = await Promise.all(paths.filter((p) => mine.has(p) && !used.has(publicUrl(cfg, p))).map((p) => deleteObject(cfg, p)));
    return NextResponse.json({ ok: results.every(Boolean) });
  } catch { return NextResponse.json({ error: "Could not delete." }, { status: 400 }); }
}
