import Link from "next/link";
import { notFound } from "next/navigation";
import { adminAccess } from "@/server/admin/access";
import { isUuid, rpcJson, when } from "@/server/admin/data";
import type { AdminUserDetail } from "@/shared/admin-types";
import { Chip, Stat, card } from "@/components/admin/ui";
import { ModerationControl } from "@/components/admin/ModerationControl";
export default async function UserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; if (!isUuid(id)) notFound();
  const { role } = await adminAccess(); const d = await rpcJson<AdminUserDetail>("admin_user_detail", { uid: id }); if (!d) notFound();
  const u = d.user; const open = d.reports_against.filter(r => r.review_status === "open").length;
  return <>
    <p className="mb-3 text-xs text-muted"><Link href="/admin/users" className="underline">Users</Link> / @{u.handle}</p>
    <div className={`${card} mb-5 flex flex-wrap items-center justify-between gap-4`}>
      <div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage text-2xl font-extrabold text-white">{(u.display_name || u.handle)[0].toUpperCase()}</div>
        <div><h1 className="text-2xl font-extrabold">{u.display_name || u.handle} {u.is_owner && <Chip>Owner</Chip>} {u.admin_verified && <Chip>Reviewed</Chip>} {u.suspended && <Chip tone="warn">Suspended</Chip>} {!u.suspended && u.posting_blocked && <Chip tone="warn">Posting blocked</Chip>} {open > 0 && <Chip tone="warn">{open} open report(s)</Chip>}</h1>
          <p className="mt-1 text-sm text-muted">@{u.handle} · {u.provider} login · joined {when(u.created_at)} · last seen {when(u.last_sign_in_at)}</p>{u.bio && <p className="mt-1 text-sm">{u.bio}</p>}</div></div>
      {!u.is_owner && role !== "moderator" && <div className="flex flex-wrap items-start gap-2">
        <ModerationControl kind="builder" target={u.id} decision={u.admin_verified ? "unverify" : "verify"} label={u.admin_verified ? "Remove review badge" : "Mark reviewed"} />
        {!u.suspended && <ModerationControl kind="builder" target={u.id} decision={u.posting_blocked ? "unblock" : "block"} label={u.posting_blocked ? "Unblock posting" : "Block posting"} needReason={!u.posting_blocked} />}
        <ModerationControl kind="builder" target={u.id} decision={u.suspended ? "unsuspend" : "suspend"} label={u.suspended ? "Lift suspension" : "Suspend account"} danger={!u.suspended} needReason={!u.suspended} /></div>}
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Projects" value={d.projects.length} /><Stat label="Comments" value={u.comments} /><Stat label="Image slots" value={`${u.reserved_slots} / 20`} /><Stat label="Reports against" value={d.reports_against.length} warn={open > 0} note={`${d.reports_filed} filed by them`} /></div>
    <div className="mt-5 grid gap-5 xl:grid-cols-2">
      <div className={card}><h2 className="mb-2 text-lg font-bold">Projects and drafts</h2>{d.projects.map(p => <Link key={p.id} href={`/admin/projects/${p.id}`} className="flex items-center justify-between border-t border-line py-2.5 text-sm"><b>{p.title}</b><span>{p.moderated_hidden ? <Chip tone="warn">Hidden</Chip> : p.status === "draft" ? <Chip tone="mute">Draft</Chip> : <Chip>Live</Chip>}</span></Link>)}{!d.projects.length && <p className="text-sm text-muted">No projects.</p>}</div>
      <div className={card}><h2 className="mb-2 text-lg font-bold">Reports against this user</h2>{d.reports_against.map(r => <div key={r.id} className="border-t border-line py-2.5 text-sm"><b className="capitalize">{r.reason}</b> on {r.target} <span className="text-xs text-muted">· by @{r.reporter} · {r.review_status}</span></div>)}{!d.reports_against.length && <p className="text-sm text-muted">No reports.</p>}</div>
      <div className={card}><h2 className="mb-2 text-lg font-bold">Recent activity</h2>{d.activity.map((a, i) => <div key={i} className="flex justify-between border-t border-line py-2.5 text-sm"><span>{a.what}</span><span className="text-xs text-muted">{when(a.created_at)}</span></div>)}{!d.activity.length && <p className="text-sm text-muted">No activity yet.</p>}</div>
      <div className={card}><h2 className="mb-2 text-lg font-bold">Admin history</h2>{d.history.map((h, i) => <div key={i} className="border-t border-line py-2.5 text-sm"><span className="capitalize">{h.action}</span> <span className="text-xs text-muted">· {when(h.created_at)}</span>{h.reason && <p className="text-xs text-muted">Reason: {h.reason}</p>}</div>)}{!d.history.length && <p className="text-sm text-muted">No admin actions yet.</p>}</div>
    </div>
    <p className="mt-5 text-xs text-muted">Shown: handle, name, login provider, dates, counts and public content. Never shown: email, tokens, passwords, GitHub access, IP addresses, private repo code.</p>
  </>;
}
