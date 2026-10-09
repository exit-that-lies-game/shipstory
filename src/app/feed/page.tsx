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
          <div className="relative mb-5 sm:mb-6">
            <svg aria-hidden className="pointer-events-none absolute -right-10 -top-10 hidden h-44 w-72 text-[#f3d9cc] opacity-60 md:block" viewBox="0 0 400 260" fill="currentColor"><path d="M380 0C300 20 250 80 240 170c-4 40-40 70-90 80 90 20 200-20 240-120 10-40 0-90-10-130z" /></svg>
            <div className="relative">
              {q || tag ? <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1> : <><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Welcome to ShipStory</p><h1 className="mt-1 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">Discover. Follow. Build.</h1><p className="mt-1 text-sm text-muted">Explore real projects, meet builders and stay inspired.</p></>}
            </div>
          </div>
          <div className="mb-5"><FeedTabs sort={s} tag={tag} q={q} following={view === "following"} layout={layout} count={projects.length} /></div>
          {view === "following" && !viewer ? <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted"><Link href="/login?next=/feed%3Fview%3Dfollowing" className="font-semibold text-terracotta">Sign in</Link> to see projects from builders you follow.</p> : <ProjectGrid layout={layout} projects={projects} empty={q ? `No projects match "${q}". Try a tag, a builder name or fewer words.` : view === "following" ? "Follow builders to see their projects here. Pick some from Explore." : undefined} />}
          {q && found.length > 0 && <section aria-label="Matching builders" className="mt-10"><h2 className="mb-3 text-lg font-bold">Builders</h2><ul className="flex flex-wrap gap-3">{found.map((b) => <li key={b.id}><Link href={`/u/${b.handle}`} className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold hover:border-olive"><Avatar name={b.name} size={28} />{b.handle}</Link></li>)}</ul></section>}
        <div className="mt-10 xl:hidden"><Rising builders={builders} /></div>
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
    <section aria-label="Rising builders" className="rounded-3xl border border-[#efe9d6] bg-white p-5 shadow-soft sm:p-6">
      <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Rising builders</h2><Link href="/search" className="flex items-center gap-1 text-xs font-medium text-terracotta">Find builders<Icon name="arrow" size={12} /></Link></div>
      {builders.length === 0 ? <p className="mt-3 text-sm text-muted">No rising builders yet. Publish a project or follow someone and this fills in.</p> : (
        <ul className="mt-4 space-y-4">
          {builders.map((b) => (
            <li key={b.id} className="flex items-center gap-3">
              <Avatar name={b.name} src={b.avatarUrl} size={44} />
              <Link href={`/u/${b.handle}`} className="min-w-0 flex-1"><b className="block truncate text-sm">{b.handle}</b><span className="text-xs text-muted">{[b.projectCount > 0 && `${b.projectCount} ${b.projectCount === 1 ? "project" : "projects"}`, b.followers > 0 && `+${b.followers} new ${b.followers === 1 ? "follower" : "followers"}`].filter(Boolean).join(" · ")}</span></Link>
              <FollowButton compact userId={b.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
