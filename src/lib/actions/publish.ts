import { safeHttpUrl } from "../safe-url";
import { createClient } from "../supabase/client";
import { currentUserId } from "./auth";

export type PublishInput = { title: string; pitch: string; description: string; tags: string[]; demoUrl: string; repoUrl: string; cover: File; shots: File[] };
export type PublishResult = { ok: true; slug: string } | { ok: false; reason: "auth" | "limit" | "error"; message?: string };

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "project";

async function upload(path: string, file: File): Promise<string> {
  const sb = createClient();
  const { error } = await sb.storage.from("project-media").upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  return sb.storage.from("project-media").getPublicUrl(path).data.publicUrl;
}

export async function publishProject(input: PublishInput): Promise<PublishResult> {
  const uid = await currentUserId();
  if (!uid) return { ok: false, reason: "auth" };
  try {
    if (!safeHttpUrl(input.demoUrl) || (input.repoUrl && !safeHttpUrl(input.repoUrl))) return { ok: false, reason: "error", message: "Use an http or https project link." };
    if (input.shots.length > 6 || ![input.cover, ...input.shots].every(f => ["image/png", "image/jpeg", "image/webp"].includes(f.type))) return { ok: false, reason: "error", message: "Use PNG, JPG or WebP images, up to 6 screenshots." };
    if (input.cover.size > 5 * 1024 * 1024 || input.shots.some((f) => f.size > 5 * 1024 * 1024)) return { ok: false, reason: "error", message: "Images must be 5 MB or smaller." };
    const files = [input.cover, ...input.shots];
    const sb = createClient();
    const { data: paths, error: reservationError } = await sb.rpc("reserve_media_slots", { amount: files.length });
    if (reservationError || !Array.isArray(paths)) return { ok: false, reason: "error", message: reservationError?.message ?? "Could not reserve media space. Try again." };
    const uploaded: string[] = [];
    let cover: string;
    let shots: string[];
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        urls.push(await upload(paths[i], files[i]));
        uploaded.push(paths[i]);
      }
      [cover, ...shots] = urls;
    } catch (error) {
      if (uploaded.length) await sb.storage.from("project-media").remove(uploaded);
      throw error;
    }
    const slug = `${slugify(input.title)}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await createClient().from("projects").insert({
      slug, owner_id: uid, title: input.title.trim(), tagline: input.pitch.trim(), description: input.description.trim(),
      live_url: input.demoUrl, repo_url: input.repoUrl || null, tags: input.tags.map((t) => t.toLowerCase()), cover_url: cover, screenshots: shots,
    });
    if (error) {
      await sb.storage.from("project-media").remove(uploaded);
      return { ok: false, reason: error.message.includes("Rate limit") ? "limit" : "error", message: error.message };
    }
    return { ok: true, slug };
  } catch (e) {
    return { ok: false, reason: "error", message: e instanceof Error ? e.message : "Upload failed" };
  }
}
