import Link from "next/link";
import { getOverview, olderThanDay, when } from "@/server/admin/data";
import { PageHead, Tabs, Chip, Empty, SearchBox, card } from "@/components/admin/ui";
import { ModerationControl } from "@/components/admin/ModerationControl";
export default async function Reports({ searchParams }: { searchParams: Promise<{ s?: string; q?: string }> }) {
  const d = (await getOverview())!; const p = await searchParams;
  const s = ["open", "resolved", "dismissed"].includes(p.s ?? "") ? p.s! : "open"; const q = (p.q ?? "").slice(0, 100).toLowerCase();
  const n = (k: string) => d.reports.filter(r => r.review_status === k).length;
  const list = d.reports.filter(r => r.review_status === s && `${r.reason} ${r.reporter} ${r.project_title}`.toLowerCase().includes(q));
  return <>
    <PageHead title="Reports" sub="Things people flagged. Every decision is logged." />
    <Tabs active={s} items={[{ key: "open", label: `Open ${n("open")}`, href: "/admin/reports?s=open" }, { key: "resolved", label: `Resolved ${n("resolved")}`, href: "/admin/reports?s=resolved" }, { key: "dismissed", label: `Dismissed ${n("dismissed")}`, href: "/admin/reports?s=dismissed" }]} />
    <SearchBox action="/admin/reports" q={p.q} placeholder="Search reports..." hidden={{ s }} />
    <div className="space-y-4">{list.map(r => <article key={r.id} className={card}>
      <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-bold capitalize">{r.reason} <span className="font-normal normal-case text-muted">· {r.comment_id ? "comment" : "project"}</span></h2><p className="mt-1 text-sm text-muted">{r.project_title || "Unavailable content"} · reported by @{r.reporter} · {when(r.created_at)}</p></div>{olderThanDay(r.created_at) && r.review_status === "open" && <Chip tone="warn">24h+</Chip>}</div>
      {r.comment_body && <blockquote className="mt-3 border-l-2 border-sage pl-3 text-sm">{r.comment_body}</blockquote>}
      <p className="mt-3 whitespace-pre-wrap text-sm">{r.details || "No extra details."}</p>
      <div className="mt-4 flex flex-wrap items-start gap-3">
        {r.project_id && <Link href={`/admin/projects/${r.project_id}`} className="rounded-lg border border-line bg-paper px-3 py-2 text-xs font-semibold text-olive">Open project</Link>}
        {r.review_status === "open" ? <><ModerationControl kind="report" target={r.id} decision="resolved" label="Resolve" danger /><ModerationControl kind="report" target={r.id} decision="dismissed" label="Dismiss" /></> : <ModerationControl kind="report" target={r.id} decision="open" label="Reopen" />}
        {(r.comment_id || r.project_id) && <><ModerationControl kind={r.comment_id ? "comment" : "project"} target={(r.comment_id || r.project_id)!} decision="hide" label="Hide content" /><ModerationControl kind={r.comment_id ? "comment" : "project"} target={(r.comment_id || r.project_id)!} decision="restore" label="Restore content" /></>}
      </div></article>)}{!list.length && <Empty label={s === "open" ? "No open reports. A little breathing room." : "Nothing here."} />}</div>
  </>;
}
