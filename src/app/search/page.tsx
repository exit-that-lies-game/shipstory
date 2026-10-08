import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { listProjects, searchBuilders } from "@/lib/data";

export const metadata = { title: "Search - ShipStory" };

export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 60);
  const [builders, projects] = q ? await Promise.all([searchBuilders(q), listProjects({ q })]) : [[], []];
  return (
    <>
      <AppNav />
      <main id="main" className="mx-auto max-w-5xl px-5 py-6 lg:px-8">
        <form action="/search" role="search" className="relative">
          <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} autoFocus={!q} enterKeyHint="search" placeholder="Search projects, tags, builders..." aria-label="Search projects and builders" className="w-full rounded-xl border border-line bg-paper py-3 pl-11 pr-4 text-base outline-none placeholder:text-[#9a9b86] focus:border-olive focus:ring-2 focus:ring-[#a3b18a55]" />
        </form>
        {!q ? <p className="mt-8 text-center text-muted">Type a project, tag or builder name.</p> : (
          <>
            <section aria-label="Builders" className="mt-8">
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
