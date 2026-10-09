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
