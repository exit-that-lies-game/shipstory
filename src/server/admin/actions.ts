"use server";
import { revalidatePath } from "next/cache";
import { adminAccess } from "./access";
export async function moderate(kind: string, target: string, decision: string, reason?: string) {
  const { sb, allowed } = await adminAccess();
  if (!allowed) return { error: "Admin access required." };
  if (!/^[0-9a-f-]{36}$/i.test(target)) return { error: "Invalid item." };
  const { error } = await sb.rpc("admin_moderate", { kind, target, decision, reason: (reason ?? "").slice(0, 300) });
  if (error) return { error: /reason/i.test(error.message) ? "Add a reason (at least 5 characters)." : "Could not save. Refresh and try again." };
  revalidatePath("/admin","layout"); revalidatePath("/feed"); revalidatePath("/p", "layout");
  return { ok: true };
}
export async function saveAnnouncement(heading: string, message: string) {
 const {sb, allowed} = await adminAccess();
 if (!allowed) return {error: "Admin access required."};
 const {error} = await sb.rpc("admin_save_announcement",{heading,message});
 if(error) return {error: "Use a title up to 100 characters and a message up to 500."};
 revalidatePath("/admin");return {ok:true};
}
