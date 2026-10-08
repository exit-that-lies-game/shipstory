"use server";
import { revalidatePath } from "next/cache";
import { adminAccess } from "./access";
import { r2Config } from "@/server/storage/r2";
export async function moderate(kind: string, target: string, decision: string, reason?: string) {
  const { sb, allowed } = await adminAccess();
  if (!allowed) return { error: "Admin access required." };
  if (!/^[0-9a-f-]{36}$/i.test(target)) return { error: "Invalid item." };
  const { error } = await sb.rpc("admin_moderate", { kind, target, decision, reason: (reason ?? "").slice(0, 300) });
  if (error) return { error: /reason/i.test(error.message) ? "Add a reason (at least 5 characters)." : "Could not save. Refresh and try again." };
  revalidatePath("/admin","layout"); revalidatePath("/feed"); revalidatePath("/p", "layout");
  return { ok: true };
}
export async function saveAnnouncement(heading: string, message: string, image?: string, link?: string) {
 const {sb, role} = await adminAccess();
 if (role !== "owner" && role !== "admin") return {error: "Admin access required."};
 const img = (image ?? "").trim(), lnk = (link ?? "").trim();
 const base = r2Config()?.publicBase;
 if (img && (!base || !img.startsWith(base + "/"))) return {error: "Use an image uploaded here."};
 if (lnk && !/^(\/[A-Za-z0-9._~\/?=&#%-]*|https:\/\/[^\s]+)$/.test(lnk)) return {error: "Link must start with / or https://."};
 const {error} = await sb.rpc("admin_save_announcement",{heading,message,image: img || null,link: lnk || null});
 if(error) return {error: "Use a title up to 100 characters and a message up to 500."};
 revalidatePath("/admin","layout");return {ok:true};
}

async function roleOf() { const { sb, allowed, role } = await adminAccess(); return { sb, allowed, role }; }
export async function grantAccess(email: string, role: string, confirmEmail: string) {
  const { sb, role: mine } = await roleOf();
  if (mine !== "owner") return { error: "Only the owner can change access." };
  const em = email.trim().toLowerCase();
  if (em !== confirmEmail.trim().toLowerCase()) return { error: "The two emails do not match." };
  if (!["admin", "moderator"].includes(role)) return { error: "Choose a role." };
  const { data, error } = await sb.rpc("admin_grant_access", { person_email: em, new_role: role });
  if (error) return { error: /valid email/i.test(error.message) ? "Enter a valid email." : /owner/i.test(error.message) ? "The owner role cannot be changed." : "Could not save. Try again." };
  revalidatePath("/admin", "layout");
  return { ok: true, status: data === "granted" ? "Access granted. They see Admin now." : "Invite saved. It activates when this email signs in with Google or GitHub." };
}
export async function revokeAccess(target: { member?: string; invite?: string }) {
  const { sb, role: mine } = await roleOf();
  if (mine !== "owner") return { error: "Only the owner can change access." };
  const member = target.member && /^[0-9a-f-]{36}$/i.test(target.member) ? target.member : null;
  const invite = target.invite ? target.invite.trim().toLowerCase().slice(0, 254) : null;
  if (!member && !invite) return { error: "Nothing to remove." };
  const { error } = await sb.rpc("admin_revoke_access", { member, invite_email: invite });
  if (error) return { error: /own access/i.test(error.message) ? "You cannot remove your own access." : /owner/i.test(error.message) ? "The owner cannot be removed." : "Could not remove. Try again." };
  revalidatePath("/admin", "layout");
  return { ok: true };
}
