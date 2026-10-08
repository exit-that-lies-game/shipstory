import { createClient } from "../supabase/client";
import { currentUserId } from "./auth";

export async function reportProject(projectId: string, reason: string): Promise<"ok" | "auth" | "error"> {
  const uid = await currentUserId();
  if (!uid) return "auth";
  const { error } = await createClient().from("reports").insert({ reporter_id: uid, project_id: projectId, reason });
  return error ? "error" : "ok";
}

export async function reportComment(commentId: string, reason: string): Promise<"ok" | "auth" | "error"> {
  const uid = await currentUserId();
  if (!uid) return "auth";
  const { error } = await createClient().from("reports").insert({ reporter_id: uid, comment_id: commentId, reason });
  return error ? "error" : "ok";
}
