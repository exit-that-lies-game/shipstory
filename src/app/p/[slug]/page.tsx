import { ProjectUpdates } from "@/components/updates/ProjectUpdates";
import { TryProject } from "@/components/project/TryProject";
import { supabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/server/supabase/server";
import { getViewer } from "@/server/data";
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
import { getProfile, getProject, getProjectGate, listAccess, listComments } from "@/server/data";
import { OwnerVisibility } from "@/components/visibility/OwnerVisibility";
import { VisibilityBadge } from "@/components/visibility/VisibilityBadge";
import { PrivateScreen } from "@/components/visibility/PrivateScreen";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getProject((await params).slug);
  if (!p) return { title: "Not found - ShipStory", robots: { index: false } };
  if (p.visibility && p.visibility !== "public") return { title: `${p.title} - ShipStory`, robots: { index: false, follow: false } };
  return { title: `${p.title} - ShipStory`, description: p.pitch, openGraph: { title: p.title, description: p.pitch }, twitter: { card: "summary_large_image", title: p.title, description: p.pitch } };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const slug = (await params).slug;
  const project = await getProject(slug);
  if (!project) {
    const gate = await getProjectGate(slug);
    if (gate) return <PrivateScreen gate={gate} signedIn={!!(await getViewer())} />;
    notFound();
  }
  const [comments, owner] = await Promise.all([listComments(project.id), getProfile(project.owner.handle)]);
  const sb = supabaseConfigured ? await createClient() : null;
  const [viewer, updateResult] = await Promise.all([getViewer(), (sb ? sb.from("project_updates").select("id,title,body,created_at").eq("project_id",project.id).order("created_at",{ascending:false}).limit(50) : Promise.resolve({ data: [] as { id: string; title: string; body: string; created_at: string }[] }))]);
  const isOwner = viewer?.id === project.owner.id;
  const access = isOwner && project.visibility === "private" ? await listAccess(project.id) : [];
  const host = project.demoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <>
      <AppNav />
      <div className="mx-auto grid max-w-[1300px] gap-10 px-5 py-8 lg:grid-cols-[1fr_380px] lg:px-8">
        <div className="min-w-0">
          <DoodleBack href="/feed" label="Back to feed" />
          <ScreenshotGallery images={project.screenshots.length ? project.screenshots : [project.cover]} title={project.title} host={host} />
          <section className="mt-10"><h2 className="text-xl font-bold">About</h2><p className="mt-2 max-w-3xl leading-relaxed text-[#4a4c38]">{project.description}</p></section>
          <ProjectUpdates projectId={project.id} owner={viewer?.id===project.owner.id} initial={updateResult.data??[]}/>
          <div className="mt-10"><CommentSection initial={comments} total={project.comments} projectId={project.id} /></div>
        </div>
        <aside className="lg:sticky lg:top-[92px] lg:self-start">
          <VisibilityBadge v={project.visibility} className="mb-3" />
          <h1 className="text-4xl font-extrabold tracking-[-0.03em]">{project.title}</h1>
          <p className="mt-2 text-[17px] leading-relaxed text-muted">{project.pitch}</p>
          <div className="mt-5 flex items-center gap-3">
            <Avatar name={project.owner.name} src={project.owner.avatarUrl} size={34} />
            <Link href={`/u/${project.owner.handle}`} className="font-semibold hover:text-terracotta">{project.owner.handle}</Link>
            <span className="text-sm text-muted">&middot; {new Date(project.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            <span className="ml-auto"><FollowButton compact userId={project.owner.id} /></span>
          </div>
          {isOwner && <OwnerVisibility projectId={project.id} initial={project.visibility ?? "public"} people={access} />}
          <TryProject id={project.id} url={project.demoUrl}/>
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
