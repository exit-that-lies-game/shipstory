import { createClient } from "../supabase/client";
import { currentUserId } from "./auth";

export type PostResult = { ok: true; id: string; handle: string; name: string } | { ok: false; reason: "auth" | "limit" | "error" };

export async function postComment(projectId: string, body: string): Promise<PostResult> {
  const uid = await currentUserId();
  if (!uid) return { ok: false, reason: "auth" };
  const sb = createClient();
  const { data, error } = await sb.from("comments").insert({ project_id: projectId, author_id: uid, body }).select("id").single();
  if (error || !data) return { ok: false, reason: error?.message.includes("Rate limit") ? "limit" : "error" };
  const { data: p } = await sb.from("profiles").select("handle, display_name").eq("id", uid).single();
  return { ok: true, id: data.id, handle: p?.handle ?? "you", name: p?.display_name ?? "You" };
}

export async function toggleCommentLike(commentId: string, on: boolean): Promise<boolean | "auth"> {
  const uid = await currentUserId();
  if (!uid) return "auth";
  const q = createClient().from("comment_likes");
  const { error } = on ? await q.upsert({ user_id: uid, comment_id: commentId }, { ignoreDuplicates: true }) : await q.delete().match({ user_id: uid, comment_id: commentId });
  return error ? !on : on;
}
