import { notFound } from "next/navigation";
import { AppNav } from "@/components/layout/AppNav";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { FollowButton } from "@/components/profile/FollowButton";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { getProfile, listProjects } from "@/lib/data";

export default async function Profile({ params }: { params: Promise<{ handle: string }> }) {
  const profile = await getProfile((await params).handle);
  if (!profile) notFound();
  const projects = await listProjects({ ownerHandle: profile.handle });
  const stat = (n: string | number, l: string, icon: "folder" | "users" | "heart") => (
    <span className="flex items-center gap-2 text-sm text-muted"><Icon name={icon} size={16} /><b className="text-ink">{n}</b>{l}</span>
  );
  return (
    <>
      <AppNav active="mine" />
      <main className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
        <div className="flex flex-wrap items-center gap-6">
          <Avatar name={profile.name} size={112} />
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight">{profile.name}</h1>
            <p className="mt-1 text-muted">@{profile.handle} &middot; {profile.headline} &middot; {profile.location}</p>
            <p className="mt-2 text-[15px]">{profile.bio}</p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">{stat(profile.projectCount, "projects", "folder")}{stat(profile.followers, "followers", "users")}{stat(profile.reactions >= 1000 ? `${(profile.reactions / 1000).toFixed(1)}k` : profile.reactions, "reactions", "heart")}</div>
          </div>
          <div className="flex gap-3"><FollowButton />{profile.github && <Button href={profile.github} variant="ghost" size="md"><Icon name="github" size={16} />GitHub</Button>}</div>
        </div>
        <div className="mb-6 mt-10 flex gap-2 border-b border-line pb-4"><Chip active>Projects</Chip><Chip>Updates</Chip><Chip>Saved</Chip></div>
        <ProjectGrid projects={projects} showOwner={false} />
      </main>
    </>
  );
}
