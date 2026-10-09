import { createClient } from "../supabase/client";
import type { Visibility } from "@/shared/types";

export type Granted = { id: string; handle: string };

export async function findHandle(handle: string): Promise<Granted | null> {
  const { data } = await createClient().from("profiles").select("id, handle").eq("handle", handle.replace(/^@/, "").toLowerCase()).maybeSingle();
  return data ?? null;
}

export async function setVisibility(projectId: string, v: Visibility): Promise<string | null> {
  const { error } = await createClient().from("projects").update({ visibility: v }).eq("id", projectId);
  return error ? "Could not change visibility. Try again." : null;
}

export async function grantAccess(projectId: string, userId: string): Promise<string | null> {
  const { error } = await createClient().from("project_access").insert({ project_id: projectId, user_id: userId });
  if (!error) return null;
  if (error.code === "23505") return "Already added.";
  return error.message.includes("full") ? "The list is full (50 people)." : "Could not add that person. Try again.";
}

export async function revokeAccess(projectId: string, userId: string): Promise<string | null> {
  const { error } = await createClient().from("project_access").delete().eq("project_id", projectId).eq("user_id", userId);
  return error ? "Could not remove that person. Try again." : null;
}

export type Suggestion = { handle: string; name: string };

// Existing builders only, matched by the start of their handle as you type. Never includes yourself.
export async function searchHandles(q: string): Promise<Suggestion[]> {
  const term = q.replace(/^@/, "").toLowerCase().replace(/[^a-z0-9_]/g, "");
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  let query = sb.from("profiles").select("handle, display_name").ilike("handle", `${term}%`).order("handle").limit(8);
  if (auth.user) query = query.neq("id", auth.user.id);
  const { data } = await query;
  return (data ?? []).map((r: { handle: string; display_name: string | null }) => ({ handle: r.handle, name: r.display_name ?? r.handle }));
}
