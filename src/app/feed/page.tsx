import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { FeedTabs } from "@/components/project/FeedTabs";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { Avatar } from "@/components/ui/Avatar";
import { FollowButton } from "@/components/profile/FollowButton";
import { listProjects, listRisingBuilders, listTopics } from "@/lib/data";

type SP = Promise<{ sort?: string; tag?: string; q?: string; view?: string }>;

export default async function Feed({ searchParams }: { searchParams: SP }) {
  const { sort, tag, q, view } = await searchParams;
  const s = sort === "latest" ? "latest" : "trending";
  const [projects, builders, topics] = await Promise.all([listProjects({ sort: s, tag, q }), listRisingBuilders(), listTopics()]);
  const title = q ? `Results for "${q}"` : tag ? tag : view === "following" ? "Following" : s === "latest" ? "Latest" : "Trending";
  return (
    <>
      <AppNav active={sort === "latest" ? "explore" : view === "following" ? "following" : "home"} q={q} />
      <div className="mx-auto flex max-w-[1400px] gap-8 px-5 py-8 lg:px-8">
        <Sidebar active={sort === "latest" ? "explore" : "home"} activeTag={tag} topics={topics} />
        <main className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div><h1 className="text-2xl font-extrabold tracking-tight">{title}</h1><p className="text-sm text-muted">{projects.length} projects</p></div>
            <FeedTabs sort={s} tag={tag} q={q} />
          </div>
          <ProjectGrid projects={projects} />
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
