import Link from "next/link";
import { getOverview } from "@/server/admin/data";
import { PageHead, Tabs, Chip, Empty, SearchBox, card } from "@/components/admin/ui";
import { ModerationControl } from "@/components/admin/ModerationControl";
export default async function Projects({ searchParams }: { searchParams: Promise<{ s?: string; q?: string }> }) {
  const d = (await getOverview())!; const p = await searchParams;
  const s = ["live", "drafts", "hidden", "reported"].includes(p.s ?? "") ? p.s! : "live"; const q = (p.q ?? "").slice(0, 100).toLowerCase();
  const reported = new Set(d.reports.filter(r => r.review_status === "open" && r.project_id).map(r => r.project_id));
  const pick: Record<string, (x: (typeof d.projects)[number]) => boolean> = { live: x => x.status === "published" && !x.moderated_hidden, drafts: x => x.status === "draft", hidden: x => x.moderated_hidden, reported: x => reported.has(x.id) };
  const n = (k: string) => d.projects.filter(pick[k]).length;
  const list = d.projects.filter(pick[s]).filter(x => `${x.title} ${x.owner} ${x.status}`.toLowerCase().includes(q));
  return <>
    <PageHead title="Projects" sub="Click a project to see everything about it." />
    <Tabs active={s} items={(["live", "drafts", "hidden", "reported"] as const).map(k => ({ key: k, label: `${k[0].toUpperCase()}${k.slice(1)} ${n(k)}`, href: `/admin/projects?s=${k}` }))} />
    <SearchBox action="/admin/projects" q={p.q} placeholder="Search projects..." hidden={{ s }} />
    <p className="mb-4 text-xs text-muted">Latest 100 projects. Drafts are saved but not published; admins can view them, not edit.</p>
    <div className="space-y-3">{list.map(x => <article key={x.id} className={`${card} flex flex-wrap items-center justify-between gap-4`}>
      <Link href={`/admin/projects/${x.id}`} className="min-w-0 flex-1"><h2 className="font-bold">{x.title} {x.status === "draft" && <Chip tone="mute">Draft</Chip>} {x.moderated_hidden && <Chip tone="warn">Hidden</Chip>} {reported.has(x.id) && <Chip tone="warn">Reported</Chip>}</h2><p className="mt-1 text-sm text-muted">@{x.owner} · {x.status}</p><p className="mt-1 text-sm">{x.tagline}</p></Link>
      <div className="flex items-start gap-2"><Link href={`/admin/projects/${x.id}`} className="rounded-lg border border-line bg-paper px-3 py-2 text-xs font-semibold text-olive">Open</Link><ModerationControl kind="project" target={x.id} decision={x.moderated_hidden ? "restore" : "hide"} label={x.moderated_hidden ? "Restore" : "Hide"} /></div>
    </article>)}{!list.length && <Empty label="No projects here." />}</div>
  </>;
}
