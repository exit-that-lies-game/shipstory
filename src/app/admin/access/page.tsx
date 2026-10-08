import { redirect } from "next/navigation";
import { adminAccess } from "@/server/admin/access";
import { rpcJson, when } from "@/server/admin/data";
import type { AdminAccessList } from "@/shared/admin-types";
import { PageHead, Chip, card } from "@/components/admin/ui";
import { GrantForm, RevokeButton } from "@/components/admin/AccessManager";
export default async function Access() {
  const { role, user } = await adminAccess();
  if (role !== "owner") redirect("/admin");
  const a = (await rpcJson<AdminAccessList>("admin_access_list", {})) ?? { members: [], invites: [] };
  return <>
    <PageHead title="Access" sub="Who can use this admin. Only the owner can change this." />
    <div className={card}><h2 className="mb-3 text-lg font-bold">Give access</h2><GrantForm /><p className="mt-3 text-xs text-muted">Matches the verified Google or GitHub email of the account. If they have not signed in yet, the invite waits and activates when that email signs in. They see Admin the next time they open the app.</p></div>
    <div className={`${card} mt-5`}><h2 className="mb-3 text-lg font-bold">People with access</h2>
      {a.members.map(m => <div key={m.user_id} className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-3 text-sm first:border-0"><span><b>@{m.handle}</b> <span className="text-muted">{m.email}</span><br /><span className="text-xs text-muted">since {when(m.created_at)}</span></span><span className="flex items-center gap-3"><Chip tone={m.role === "owner" ? "ok" : "mute"}>{m.role[0].toUpperCase() + m.role.slice(1)}</Chip>{m.role !== "owner" && m.user_id !== user?.id && <RevokeButton member={m.user_id} label="Revoke" />}</span></div>)}
      {a.invites.map(i => <div key={i.email} className="flex flex-wrap items-center justify-between gap-2 border-t border-line py-3 text-sm"><span><b>{i.email}</b><br /><span className="text-xs text-muted">waiting for sign-in · invited {when(i.created_at)}</span></span><span className="flex items-center gap-3"><Chip tone="mute">{i.role[0].toUpperCase() + i.role.slice(1)} (pending)</Chip><RevokeButton invite={i.email} label="Cancel invite" /></span></div>)}
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-2">
      <div className={card}><h2 className="mb-2 text-lg font-bold">Roles</h2>{[["Owner", "everything, including this page"], ["Admin", "reports, projects, users, suspend, banners"], ["Moderator", "reports and hide/restore only"]].map(([r, d]) => <div key={r} className="flex justify-between border-t border-line py-2.5 text-sm"><b>{r}</b><span className="text-xs text-muted">{d}</span></div>)}</div>
      <div className={card}><h2 className="mb-2 text-lg font-bold">Safety rules</h2><p className="text-sm leading-7 text-muted">Only the owner can grant or revoke, enforced in the database. The owner cannot be removed or demoted, and you cannot remove yourself. Every grant, invite and revoke is logged in Activity. Emails are visible only on this page.</p></div>
    </div>
  </>;
}
