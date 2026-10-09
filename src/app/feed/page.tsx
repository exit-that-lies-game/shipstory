import { FeedAnnouncements } from "@/components/admin/FeedAnnouncements";
import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { FeedTabs } from "@/components/project/FeedTabs";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/profile/FollowButton";
import { getViewer, listProjects, listRisingBuilders, listTopics, searchBuilders } from "@/server/data";

type SP = Promise<{ sort?: string; tag?: string; q?: string; view?: string; layout?: string }>;

export default async function Feed({ searchParams }: { searchParams: SP }) {
  const { sort, tag, q, view, layout: lay } = await searchParams;
  const layout = lay === "list" ? "list" : "grid";
  const s = sort === "latest" ? "latest" : "trending";
  const viewer = view === "following" ? await getViewer() : null;
  const [projects, builders, topics, found] = await Promise.all([listProjects({ sort: s, tag, q, followingOf: viewer?.id }), listRisingBuilders(), listTopics(), q ? searchBuilders(q) : Promise.resolve([])]);
  const title = q ? `Results for "${q}"` : tag ? tag : view === "following" ? "Following" : s === "latest" ? "Latest" : "Trending";
  return (
    <>
      <AppNav bare active={sort === "latest" ? "explore" : view === "following" ? "following" : "home"} q={q} />
      <div className="mx-auto flex max-w-[1400px] gap-8 px-5 py-8 lg:px-8">
        <Sidebar active={sort === "latest" ? "explore" : "home"} activeTag={tag} topics={topics} />
        <main id="main" className="min-w-0 flex-1"><FeedAnnouncements/>
          <header className="mb-6 border-b border-ink pb-5 sm:mb-8">
            <p className="label-mono text-terracotta">{q || tag ? "Search the log" : "The live build journal"}</p>
            {q || tag ? <h1 className="mt-2 text-4xl font-extrabold leading-[0.95] tracking-[-0.05em] sm:text-5xl">{title}</h1> : <><h1 className="mt-2 text-4xl font-extrabold leading-[0.95] tracking-[-0.05em] sm:text-6xl">The shipping <span className="story-serif text-terracotta">log.</span></h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">Open real projects, try them live, and follow the builders as they ship the next update.</p></>}
          </header>
          <div className="mb-6"><FeedTabs sort={s} tag={tag} q={q} following={view === "following"} layout={layout} count={projects.length} /></div>
          {view === "following" && !viewer ? <p className="border border-dashed border-ink bg-paper p-10 text-center text-muted"><Link href="/login?next=/feed%3Fview%3Dfollowing" className="font-semibold text-terracotta underline">Sign in</Link> to see projects from builders you follow.</p> : <ProjectGrid numbered layout={layout} projects={projects} empty={q ? `No projects match "${q}". Try a tag, a builder name or fewer words.` : view === "following" ? "Follow builders to see their projects here. Pick some from Explore." : undefined} />}
          {q && found.length > 0 && <section aria-label="Matching builders" className="mt-10"><h2 className="label-mono mb-3 border-b border-ink pb-2">Builders</h2><ul className="flex flex-wrap gap-3">{found.map((b) => <li key={b.id}><Link href={`/u/${b.handle}`} className="flex items-center gap-2 border border-line bg-paper px-3 py-2 text-sm font-semibold hover:border-ink hover:bg-sage"><Avatar name={b.name} size={28} />{b.handle}</Link></li>)}</ul></section>}
        <div className="mt-10 border-t border-ink pt-5 xl:hidden"><Rising builders={builders} /></div>
        </main>
        <aside className="hidden w-80 shrink-0 xl:block">
          <div className="sticky top-[92px]"><Rising builders={builders} /></div>
        </aside>
      </div>
    </>
  );
}

function Rising({ builders }: { builders: Awaited<ReturnType<typeof listRisingBuilders>> }) {
  return (
    <section aria-label="Rising builders">
      <div className="flex items-center justify-between border-b border-ink pb-2"><h2 className="label-mono">Rising builders</h2><Link href="/search" className="label-mono flex items-center gap-1 text-terracotta">Find builders<Icon name="arrow" size={12} /></Link></div>
      {builders.length === 0 ? <p className="mt-3 text-sm text-muted">No rising builders yet. Publish a project or follow someone and this fills in.</p> : (
        <ol className="divide-y divide-line">
          {builders.map((b, i) => (
            <li key={b.id} className="flex items-center gap-3 py-3.5">
              <span className="label-mono w-5 text-muted">{String(i + 1).padStart(2, "0")}</span>
              <Avatar name={b.name} src={b.avatarUrl} size={40} />
              <Link href={`/u/${b.handle}`} className="min-w-0 flex-1"><b className="block truncate text-sm">{b.handle}</b><span className="text-xs text-muted">{[b.projectCount > 0 && `${b.projectCount} ${b.projectCount === 1 ? "project" : "projects"}`, b.followers > 0 && `+${b.followers} new ${b.followers === 1 ? "follower" : "followers"}`].filter(Boolean).join(" · ")}</span></Link>
              <FollowButton compact userId={b.id} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
