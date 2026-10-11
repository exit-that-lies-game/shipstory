import { notFound } from "next/navigation";
import { AppNav } from "@/components/layout/AppNav";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { FollowButton } from "@/components/profile/FollowButton";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getProfile, listProjects } from "@/server/data";
import { getAuthUser } from "@/server/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const p = await getProfile((await params).handle);
  return p ? { title: `${p.name} (@${p.handle}) - ShipStory`, description: p.bio || `Projects by ${p.name} on ShipStory.` } : { title: "Not found - ShipStory" };
}

export default async function Profile({ params }: { params: Promise<{ handle: string }> }) {
  const profile = await getProfile((await params).handle);
  if (!profile) notFound();
  const { data: auth } = await getAuthUser().catch(() => ({ data: { user: null } }));
  const isMe = !!auth.user && auth.user.id === profile.id;
  const projects = await listProjects({ ownerHandle: profile.handle });
  const stat = (n: string | number, l: string, icon: "folder" | "users" | "heart") => (
    <span className="label-mono flex items-center gap-2 text-muted"><Icon name={icon} size={15} /><b className="text-base normal-case tracking-normal text-ink">{n}</b>{l}</span>
  );
  return (
    <>
      <AppNav active="mine" />
      <main id="main" className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
          {isMe ? <AvatarUpload name={profile.name} current={profile.avatarUrl} /> : <Avatar name={profile.name} src={profile.avatarUrl} size={96} />}
          <div className="min-w-0 flex-1">
            <p className="label-mono text-terracotta">Builder</p><h1 className="mt-1 break-words text-4xl font-extrabold leading-none tracking-[-0.05em] sm:text-5xl">{profile.name}</h1>
            <p className="mt-1 break-all text-muted sm:break-normal">{["@" + profile.handle, profile.headline, profile.location].filter(Boolean).join(" · ")}</p>
            {profile.bio ? <p className="mt-2 text-[15px]">{profile.bio}</p> : <p className="mt-2 text-[15px] text-muted">No bio yet.</p>}
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">{stat(profile.projectCount, "projects", "folder")}{stat(profile.followers, "followers", "users")}{stat(profile.reactions >= 1000 ? `${(profile.reactions / 1000).toFixed(1)}k` : profile.reactions, "reactions", "heart")}</div>
          </div>
          <div className="flex flex-wrap gap-3">{!isMe && <FollowButton userId={profile.id} />}{isMe && <Button href="/settings/profile" variant="ghost" size="md">Edit profile</Button>}{profile.github && <Button href={profile.github} variant="ghost" size="md"><Icon name="github" size={16} />GitHub</Button>}{profile.website && <Button href={profile.website} variant="ghost" size="md">Website</Button>}</div>
        </div>
        <div className="mb-6 mt-10 flex items-center justify-between border-b border-ink pb-3"><span className="label-mono">Projects · {String(projects.length).padStart(2, "0")}</span></div>
        <ProjectGrid projects={projects} showOwner={false} />
      </main>
    </>
  );
}
