import Link from "next/link";
import { getOverview } from "@/server/admin/data";
import { PageHead, Chip, Empty, SearchBox, card } from "@/components/admin/ui";
export default async function Users({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const d = (await getOverview())!; const p = await searchParams; const q = (p.q ?? "").slice(0, 100).toLowerCase();
  const list = d.builders.filter(b => `${b.handle} ${b.display_name}`.toLowerCase().includes(q));
  const reported = new Set(d.reports.filter(r => r.review_status === "open").map(r => r.reporter));
  return <>
    <PageHead title="Users" sub="Click a user to see their profile, projects, reports and activity." />
    <SearchBox action="/admin/users" q={p.q} placeholder="Search users..." />
    <p className="mb-4 text-xs text-muted">Latest 100 users. Emails are not shown here.</p>
    <div className="space-y-3">{list.map(b => <Link key={b.id} href={`/admin/users/${b.id}`} className={`${card} flex flex-wrap items-center justify-between gap-3 hover:bg-cream`}>
      <div><b>@{b.handle}</b> <span className="text-sm text-muted">{b.display_name}</span> {b.admin_verified && <Chip>Reviewed</Chip>} {b.posting_blocked && <Chip tone="warn">Posting blocked</Chip>}</div>
      <p className="text-sm text-muted">{b.projects} projects · {b.reserved_slots} / 20 image slots{reported.has(b.handle) ? "" : ""}</p></Link>)}{!list.length && <Empty label="No users match." />}</div>
  </>;
}
