import { FeedAnnouncements } from "@/components/admin/FeedAnnouncements";
import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { FeedTabs } from "@/components/project/FeedTabs";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/profile/FollowButton";
import { getViewer, listProjects, listRisingBuilders, listTopics, searchBuilders } from "@/lib/data";

type SP = Promise<{ sort?: string; tag?: string; q?: string; view?: string }>;

export default async function Feed({ searchParams }: { searchParams: SP }) {
  const { sort, tag, q, view } = await searchParams;
  const s = sort === "latest" ? "latest" : "trending";
  const viewer = view === "following" ? await getViewer() : null;
  const [projects, builders, topics, found] = await Promise.all([listProjects({ sort: s, tag, q, followingOf: viewer?.id }), listRisingBuilders(), listTopics(), q ? searchBuilders(q) : Promise.resolve([])]);
  const title = q ? `Results for "${q}"` : tag ? tag : view === "following" ? "Following" : s === "latest" ? "Latest" : "Trending";
  return (
    <>
      <AppNav active={sort === "latest" ? "explore" : view === "following" ? "following" : "home"} q={q} />
      <div className="mx-auto flex max-w-[1400px] gap-8 px-5 py-8 lg:px-8">
        <Sidebar active={sort === "latest" ? "explore" : "home"} activeTag={tag} topics={topics} />
        <main id="main" className="min-w-0 flex-1"><FeedAnnouncements/>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div><h1 className="text-2xl font-extrabold tracking-tight">{title}</h1><p className="text-sm text-muted">{projects.length} projects</p></div>
            <FeedTabs sort={s} tag={tag} q={q} />
          </div>
          {view === "following" && !viewer ? <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted"><Link href="/login?next=/feed%3Fview%3Dfollowing" className="font-semibold text-terracotta">Sign in</Link> to see projects from builders you follow.</p> : <ProjectGrid projects={projects} empty={q ? `No projects match "${q}". Try a tag, a builder name or fewer words.` : undefined} />}
          {q && found.length > 0 && <section aria-label="Matching builders" className="mt-10"><h2 className="mb-3 text-lg font-bold">Builders</h2><ul className="flex flex-wrap gap-3">{found.map((b) => <li key={b.id}><Link href={`/u/${b.handle}`} className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2 text-sm font-semibold hover:border-olive"><Avatar name={b.name} size={28} />{b.handle}</Link></li>)}</ul></section>}
        </main>
        <aside className="hidden w-72 shrink-0 xl:block">
          <div className="sticky top-[92px] rounded-2xl border border-line bg-paper p-5 shadow-soft">
            <div className="flex items-center justify-between"><h2 className="font-bold">Rising builders</h2><span className="text-xs font-medium text-terracotta">View all</span></div>
            <ul className="mt-4 space-y-4">
              {builders.map((b) => (
                <li key={b.id} className="flex items-center gap-3">
                  <Avatar name={b.name} size={38} />
                  <Link href={`/u/${b.handle}`} className="min-w-0 flex-1"><b className="block truncate text-sm">{b.handle}</b><span className="text-xs text-muted">{b.projectCount} projects</span></Link>
                  <FollowButton compact userId={b.id} />
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
