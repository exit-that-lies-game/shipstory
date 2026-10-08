/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { isUuid, rpcJson, when } from "@/server/admin/data";
import type { AdminProjectDetail } from "@/shared/admin-types";
import { Chip, card } from "@/components/admin/ui";
import { ModerationControl } from "@/components/admin/ModerationControl";
export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; if (!isUuid(id)) notFound();
  const d = await rpcJson<AdminProjectDetail>("admin_project_detail", { pid: id }); if (!d) notFound();
  const p = d.project;
  return <>
    <p className="mb-3 text-xs text-muted"><Link href="/admin/projects" className="underline">Projects</Link> / {p.title}</p>
    <div className={`${card} mb-5 flex flex-wrap items-center justify-between gap-4`}><div><h1 className="text-2xl font-extrabold">{p.title} {p.moderated_hidden ? <Chip tone="warn">Hidden by admin</Chip> : <Chip tone={p.status === "published" ? "ok" : "mute"}>{p.status === "published" ? "Live" : p.status}</Chip>} {d.reports.some(r => r.review_status === "open") && <Chip tone="warn">{d.reports.filter(r => r.review_status === "open").length} open report(s)</Chip>}</h1><p className="mt-1 text-sm text-muted">by <Link className="text-terracotta" href={`/admin/users/${p.owner_id}`}>@{p.owner}</Link> · created {when(p.created_at)} · edited {when(p.updated_at)}</p></div>
      <div className="flex flex-wrap items-start gap-2">{p.status === "published" && !p.moderated_hidden && <Link href={`/p/${p.slug}`} className="rounded-lg border border-line bg-paper px-3 py-2 text-xs font-semibold text-olive">View public page</Link>}<ModerationControl kind="project" target={p.id} decision={p.moderated_hidden ? "restore" : "hide"} label={p.moderated_hidden ? "Restore" : "Take down"} danger={!p.moderated_hidden} needReason={!p.moderated_hidden} /></div></div>
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <div className={card}>
        {p.cover_url ? <img src={p.cover_url} alt="Project cover" className="mb-4 max-h-72 w-full rounded-xl object-cover" /> : <div className="mb-4 rounded-xl bg-[#e9eed9] p-10 text-center text-sm text-olive">No cover image</div>}
        <p className="text-lg font-semibold">{p.tagline}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7">{p.description || "No description."}</p>
        <dl className="mt-4 space-y-1 text-sm"><div><dt className="inline font-semibold">Live URL: </dt><dd className="inline break-all text-muted">{p.live_url || "none"}</dd></div><div><dt className="inline font-semibold">Repo: </dt><dd className="inline break-all text-muted">{p.repo_url || "none"}</dd></div><div><dt className="inline font-semibold">Tags: </dt><dd className="inline text-muted">{p.tags.length ? p.tags.join(", ") : "none"}</dd></div></dl>
        {p.screenshots.length > 0 && <div className="mt-4 grid grid-cols-3 gap-2">{p.screenshots.map(u => <img key={u} src={u} alt="Screenshot" className="h-24 w-full rounded-lg object-cover" />)}</div>}
        <h2 className="mt-6 text-lg font-bold">Updates ({d.updates.length})</h2>{d.updates.map((u, i) => <div key={i} className="border-t border-line py-3 text-sm"><div className="flex justify-between"><b>{u.title}</b><span className="text-xs text-muted">{when(u.created_at)}</span></div><p className="mt-1 whitespace-pre-wrap text-muted">{u.body}</p></div>)}{!d.updates.length && <p className="mt-2 text-sm text-muted">No updates posted.</p>}
      </div>
      <div className="space-y-5">
        <div className={card}><h2 className="mb-2 text-lg font-bold">Numbers</h2>{[["Reactions", p.like_count], ["Saves", p.save_count], ["Comments", p.comment_count]].map(([k, v]) => <div key={k} className="flex justify-between border-t border-line py-2 text-sm"><span>{k}</span><b>{v}</b></div>)}</div>
        <div className={card}><h2 className="mb-2 text-lg font-bold">Reports on this project</h2>{d.reports.map(r => <div key={r.id} className="flex items-start justify-between gap-2 border-t border-line py-3 text-sm"><span><b className="capitalize">{r.reason}</b><br /><span className="text-xs text-muted">by @{r.reporter} · {r.review_status} · {when(r.created_at)}</span>{r.details && <><br /><span className="text-xs">{r.details}</span></>}</span>{r.review_status === "open" && <ModerationControl kind="report" target={r.id} decision="resolved" label="Resolve" danger />}</div>)}{!d.reports.length && <p className="text-sm text-muted">No reports.</p>}</div>
        <div className={card}><h2 className="mb-2 text-lg font-bold">Admin history</h2>{d.history.map((h, i) => <div key={i} className="border-t border-line py-2 text-sm"><span className="capitalize">{h.action}</span> <span className="text-xs text-muted">· {when(h.created_at)}</span>{h.reason && <p className="text-xs text-muted">Reason: {h.reason}</p>}</div>)}{!d.history.length && <p className="text-sm text-muted">No admin actions yet.</p>}</div>
      </div></div></>;
}
