import { createClient } from "../supabase/client";
import { currentUserId } from "./auth";

export async function isFollowing(followeeId: string): Promise<boolean> {
  const uid = await currentUserId();
  if (!uid) return false;
  const { data } = await createClient().from("follows").select("followee_id").match({ follower_id: uid, followee_id: followeeId }).maybeSingle();
  return !!data;
}

export async function setFollow(followeeId: string, on: boolean): Promise<boolean | "auth"> {
  const uid = await currentUserId();
  if (!uid) return "auth";
  if (uid === followeeId) return false;
  const q = createClient().from("follows");
  const { error } = on ? await q.upsert({ follower_id: uid, followee_id: followeeId }, { ignoreDuplicates: true }) : await q.delete().match({ follower_id: uid, followee_id: followeeId });
  return error ? !on : on;
}
