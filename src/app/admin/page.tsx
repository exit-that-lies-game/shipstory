import Link from "next/link";
import { getOverview, olderThanDay, when } from "@/server/admin/data";
import { PageHead, Stat, card, Empty } from "@/components/admin/ui";
export default async function AdminOverview() {
  const d = (await getOverview())!;
  const open = d.reports.filter(r => r.review_status === "open");
  const old = open.filter(r => olderThanDay(r.created_at)).length;
  const drafts = d.projects.filter(p => p.status === "draft").length;
  const live = d.projects.filter(p => p.status === "published" && !p.moderated_hidden).length;
  return <>
    <PageHead title="Overview" sub="What needs you today, then how things are growing." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Open reports" value={d.counts.reports} warn={d.counts.reports > 0} note={old ? `${old} older than 24h` : "None older than 24h"} />
      <Stat label="Projects" value={d.counts.projects} note={`${live} live, ${drafts} drafts`} />
      <Stat label="Builders" value={d.counts.builders} />
      <Stat label="Image slots" value={`${d.counts.reserved_slots} / 160`} />
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <div className={card}><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Reports queue</h2><Link href="/admin/reports" className="text-sm font-semibold text-terracotta">See all</Link></div>
        {open.length ? open.slice(0, 5).map(r => <div key={r.id} className="flex items-center justify-between gap-3 border-t border-line py-3 text-sm"><span><b className="capitalize">{r.reason}</b><br /><span className="text-xs text-muted">{r.project_title || "Unavailable content"} · by @{r.reporter}</span></span><Link href="/admin/reports" className="rounded-lg bg-terracotta px-3 py-1.5 text-xs font-semibold text-white">Review</Link></div>) : <p className="text-sm text-muted">All clear. No open reports.</p>}</div>
      <div className={card}><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Recent admin actions</h2><Link href="/admin/activity" className="text-sm font-semibold text-terracotta">Log</Link></div>
        {d.actions.length ? d.actions.slice(0, 6).map((a, i) => <div key={i} className="flex justify-between gap-2 border-t border-line py-2.5 text-sm"><span className="capitalize">{a.target_kind} · {a.action}</span><time className="text-xs text-muted">{when(a.created_at)}</time></div>) : <p className="text-sm text-muted">No admin actions yet.</p>}</div>
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-2">
      <div className={card}><h2 className="mb-3 text-lg font-bold">Newest builders</h2>{d.builders.slice(0, 4).map(b => <Link key={b.id} href={`/admin/users/${b.id}`} className="flex justify-between border-t border-line py-2.5 text-sm"><b>@{b.handle}</b><span className="text-muted">{b.projects} projects</span></Link>)}{!d.builders.length && <Empty label="No builders yet." />}</div>
      <div className={card}><h2 className="mb-3 text-lg font-bold">Newest projects</h2>{d.projects.slice(0, 4).map(p => <Link key={p.id} href={`/admin/projects/${p.id}`} className="flex justify-between border-t border-line py-2.5 text-sm"><b>{p.title}</b><span className="text-muted">@{p.owner} · {p.moderated_hidden ? "hidden" : p.status}</span></Link>)}{!d.projects.length && <Empty label="No projects yet." />}</div>
    </div>
  </>;
}
