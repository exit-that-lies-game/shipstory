import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { Avatar } from "@/components/ui/Avatar";
import { LiveSearchInput } from "@/components/layout/LiveSearchInput";
import { listProjects, searchBuilders } from "@/server/data";

export const metadata = { title: "Search - ShipStory" };

export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 60);
  const [builders, projects] = q ? await Promise.all([searchBuilders(q), listProjects({ q })]) : [[], []];
  return (
    <>
      <AppNav />
      <main id="main" className="mx-auto max-w-5xl px-5 py-6 lg:px-8">
        <LiveSearchInput initial={q} />
        {!q ? <p className="mt-8 text-center text-muted">Type a project, tag or builder name.</p> : (
          <>
            <section aria-label="Builders" aria-live="polite" className="mt-8">
              <h2 className="mb-3 text-lg font-bold">Builders</h2>
              {builders.length === 0 ? <p className="text-sm text-muted">No builders match &ldquo;{q}&rdquo;.</p> : (
                <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{builders.map((b) => <li key={b.id}><Link href={`/u/${b.handle}`} className="flex items-center gap-3 rounded-xl border border-line bg-paper px-3 py-2 hover:border-olive"><Avatar name={b.name} size={36} /><span className="min-w-0"><b className="block truncate text-sm">{b.name}</b><span className="block truncate text-xs text-muted">@{b.handle}</span></span></Link></li>)}</ul>
              )}
            </section>
            <section aria-label="Projects" className="mt-8">
              <h2 className="mb-3 text-lg font-bold">Projects</h2>
              <ProjectGrid projects={projects} empty={`No projects match "${q}". Try a tag, a builder name or fewer words.`} />
            </section>
          </>
        )}
      </main>
    </>
  );
}
