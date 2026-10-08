import { NextResponse } from "next/server";
import { adminAccess } from "@/server/admin/access";
import { sameOrigin } from "@/server/abuse/turnstile";
import { r2Config, signUpload, validFile } from "@/server/storage/r2";

// Banner uploads for owner and admin roles only. One image, same type and size limits as project media.
// Keys are adminUserId/uuid, so they never collide with builder uploads and use no builder upload slots.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  const cfg = r2Config();
  if (!cfg) return NextResponse.json({ error: "Image storage is not set up yet." }, { status: 503 });
  try {
    const { user, role } = await adminAccess();
    if (!user || (role !== "owner" && role !== "admin")) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    const f = (await request.json())?.file;
    if (!f || !validFile(f)) return NextResponse.json({ error: "Use a PNG, JPG or WebP image, 5 MB or smaller." }, { status: 400 });
    const key = `${user.id}/${crypto.randomUUID()}`;
    return NextResponse.json({ path: key, ...signUpload(cfg, key, f.type, f.size) });
  } catch { return NextResponse.json({ error: "Upload could not start. Try again." }, { status: 400 }); }
}
