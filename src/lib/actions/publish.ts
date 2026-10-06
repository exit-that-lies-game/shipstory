import { createClient } from "../supabase/client";
import { currentUserId } from "./auth";

export type PublishInput = { title: string; pitch: string; description: string; tags: string[]; demoUrl: string; repoUrl: string; cover: File; shots: File[] };
export type PublishResult = { ok: true; slug: string } | { ok: false; reason: "auth" | "limit" | "error"; message?: string };

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "project";

async function upload(uid: string, file: File): Promise<string> {
  const sb = createClient();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${uid}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from("project-media").upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  return sb.storage.from("project-media").getPublicUrl(path).data.publicUrl;
}

export async function publishProject(input: PublishInput): Promise<PublishResult> {
  const uid = await currentUserId();
  if (!uid) return { ok: false, reason: "auth" };
  try {
    if (input.cover.size > 5 * 1024 * 1024 || input.shots.some((f) => f.size > 5 * 1024 * 1024)) return { ok: false, reason: "error", message: "Images must be 5 MB or smaller." };
    const [cover, ...shots] = await Promise.all([input.cover, ...input.shots].map((f) => upload(uid, f)));
    const slug = `${slugify(input.title)}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await createClient().from("projects").insert({
      slug, owner_id: uid, title: input.title.trim(), tagline: input.pitch.trim(), description: input.description.trim(),
      live_url: input.demoUrl, repo_url: input.repoUrl || null, tags: input.tags.map((t) => t.toLowerCase()), cover_url: cover, screenshots: shots,
    });
    if (error) return { ok: false, reason: error.message.includes("Rate limit") ? "limit" : "error", message: error.message };
    return { ok: true, slug };
  } catch (e) {
    return { ok: false, reason: "error", message: e instanceof Error ? e.message : "Upload failed" };
  }
}
