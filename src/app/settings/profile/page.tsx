import { redirect } from "next/navigation";
import { AppNav } from "@/components/layout/AppNav";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { getProfile, getViewer } from "@/server/data";

export const metadata = { title: "Edit profile - ShipStory" };

export default async function EditProfile() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/settings/profile");
  const profile = await getProfile(viewer.handle);
  if (!profile) redirect("/feed");
  return (
    <>
      <AppNav active="mine" />
      <main id="main" className="mx-auto max-w-2xl px-5 py-10 lg:px-8">
        <p className="label-mono text-terracotta">Your profile</p>
        <h1 className="mt-1 text-4xl font-extrabold leading-none tracking-[-0.05em] sm:text-5xl">Edit profile</h1>
        <p className="mt-3 text-[15px] text-muted">This is what people see on your builder page. Your handle @{profile.handle} stays the same.</p>
        <ProfileForm initial={{ name: profile.name, headline: profile.headline ?? "", location: profile.location ?? "", bio: profile.bio ?? "", website: profile.website ?? "" }} handle={profile.handle} />
      </main>
    </>
  );
}
