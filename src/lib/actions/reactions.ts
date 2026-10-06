import { createClient, supabaseConfigured } from "../supabase/client";

type Table = "reactions" | "saves";

// Returns the new state, or "auth" when the visitor must sign in first. RLS enforces ownership.
export async function toggle(table: Table, projectId: string, on: boolean): Promise<boolean | "auth"> {
  if (!supabaseConfigured) return on;
  const sb = createClient();
  const { data } = await sb.auth.getUser();
  if (!data.user) return "auth";
  const q = sb.from(table);
  const { error } = on
    ? await q.upsert({ user_id: data.user.id, project_id: projectId }, { ignoreDuplicates: true })
    : await q.delete().match({ user_id: data.user.id, project_id: projectId });
  return error ? !on : on;
}

export async function myState(projectId: string): Promise<{ liked: boolean; saved: boolean }> {
  if (!supabaseConfigured) return { liked: false, saved: false };
  const sb = createClient();
  const { data } = await sb.auth.getUser();
  if (!data.user) return { liked: false, saved: false };
  const [r, s] = await Promise.all([
    sb.from("reactions").select("project_id").match({ user_id: data.user.id, project_id: projectId }).maybeSingle(),
    sb.from("saves").select("project_id").match({ user_id: data.user.id, project_id: projectId }).maybeSingle(),
  ]);
  return { liked: !!r.data, saved: !!s.data };
}
