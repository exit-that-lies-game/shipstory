import { NextResponse } from "next/server";
import { createClient } from "@/server/supabase/server";
import { sameOrigin } from "@/server/abuse/turnstile";
import { isMediaKey, keyBelongsTo, r2Config, signUpload, validFile } from "@/server/storage/r2";

// Auth, verified session and the per-user and global media quota are enforced by the reserve_media_slots
// database function, called with the signed-in user's own session. This route only adds type and size checks.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  const cfg = r2Config();
  if (!cfg) return NextResponse.json({ error: "Image storage is not set up yet." }, { status: 503 });
  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in to upload." }, { status: 401 });
    const body = await request.json();
    const files: unknown = body?.files;
    if (!Array.isArray(files) || files.length < 1 || files.length > 7 || !files.every(validFile)) return NextResponse.json({ error: "Use 1 to 7 PNG, JPG or WebP images, 5 MB or smaller." }, { status: 400 });
    const { data: paths, error } = await sb.rpc("reserve_media_slots", { amount: files.length });
    if (error || !Array.isArray(paths) || paths.length !== files.length || !paths.every((p) => isMediaKey(p) && keyBelongsTo(p, user.id))) return NextResponse.json({ error: error?.message ?? "Could not reserve media space. Try again." }, { status: 400 });
    return NextResponse.json({ uploads: paths.map((p: string, i: number) => ({ path: p, ...signUpload(cfg, p, files[i].type, files[i].size) })) });
  } catch { return NextResponse.json({ error: "Upload could not start. Try again." }, { status: 400 }); }
}
