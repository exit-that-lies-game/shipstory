import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppNav } from "@/components/layout/AppNav";
import { ScreenshotGallery } from "@/components/project/ScreenshotGallery";
import { ProjectActions } from "@/components/project/ProjectActions";
import { CommentSection } from "@/components/project/CommentSection";
import { ReportButton } from "@/components/project/ReportButton";
import { FollowButton } from "@/components/profile/FollowButton";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { DoodleBack } from "@/components/doodle/DoodleBack";
import { getProfile, getProject, listComments } from "@/lib/data";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getProject((await params).slug);
  if (!p) return { title: "Not found - ShipStory" };
  return { title: `${p.title} - ShipStory`, description: p.pitch, openGraph: { title: p.title, description: p.pitch, images: [p.cover] } };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  const [comments, owner] = await Promise.all([listComments(project.id), getProfile(project.owner.handle)]);
  const host = project.demoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <>
      <AppNav />
      <div className="mx-auto grid max-w-[1300px] gap-10 px-5 py-8 lg:grid-cols-[1fr_380px] lg:px-8">
        <div className="min-w-0">
          <DoodleBack href="/feed" label="Back to feed" />
          <ScreenshotGallery images={project.screenshots} title={project.title} host={host} />
          <section className="mt-10"><h2 className="text-xl font-bold">About</h2><p className="mt-2 max-w-3xl leading-relaxed text-[#4a4c38]">{project.description}</p></section>
          <div className="mt-10"><CommentSection initial={comments} total={project.comments} projectId={project.id} /></div>
        </div>
        <aside className="lg:sticky lg:top-[92px] lg:self-start">
          <h1 className="text-4xl font-extrabold tracking-[-0.03em]">{project.title}</h1>
          <p className="mt-2 text-[17px] leading-relaxed text-muted">{project.pitch}</p>
          <div className="mt-5 flex items-center gap-3">
            <Avatar name={project.owner.name} size={34} />
            <Link href={`/u/${project.owner.handle}`} className="font-semibold hover:text-terracotta">{project.owner.handle}</Link>
            <span className="text-sm text-muted">&middot; {new Date(project.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            <span className="ml-auto"><FollowButton compact userId={project.owner.id} /></span>
          </div>
          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-terracotta py-4 text-[17px] font-bold text-white shadow-[0_12px_24px_-10px_#c15a3acc] transition-colors hover:bg-[#ad4d30]"><Icon name="play" size={17} />Try it live</a>
          <div className="mt-3"><ProjectActions likes={project.likes} saves={project.saves} title={project.title} projectId={project.id} /></div>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.stack.map((t) => <Chip key={t}>{t}</Chip>)}
            {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noopener noreferrer"><Chip><Icon name="code" size={13} />Repo</Chip></a>}
          </div>
          <div className="mt-5 rounded-2xl border border-line bg-paper p-5 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9a9b86]">Project stats</p>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex justify-between"><dt>Reactions</dt><dd className="font-bold">{project.likes}</dd></div>
              <div className="flex justify-between"><dt>Saves</dt><dd className="font-bold">{project.saves}</dd></div>
              <div className="flex justify-between"><dt>Followers of builder</dt><dd className="font-bold">{owner?.followers ?? 0}</dd></div>
            </dl>
          </div>
          <div className="mt-4"><ReportButton projectId={project.id} /></div>
        </aside>
      </div>
    </>
  );
}
