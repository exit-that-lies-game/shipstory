import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { FollowButton } from "@/components/profile/FollowButton";
import { Icon } from "@/components/ui/Icon";
import type { ProjectGate } from "@/server/data";

export function PrivateScreen({ gate, signedIn }: { gate: ProjectGate; signedIn: boolean }) {
  const followers = gate.visibility === "followers";
  return (
    <>
      <AppNav />
      <main id="main" className="mx-auto max-w-md px-5 py-20 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e9eed9] text-olive"><Icon name="lock" size={26} /></span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight">This project is private</h1>
        <p className="mt-2 text-sm text-muted">
          {followers ? <>Only people who follow <b className="text-ink">@{gate.owner_handle}</b> can see it.</> : <>The builder shares it with chosen accounts only.</>}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          {followers && (signedIn ? <FollowButton userId={gate.owner_id} /> : <Link href="/login" className="rounded-xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#ad4d30]">Sign in to follow</Link>)}
          <Link href={`/u/${gate.owner_handle}`} className="rounded-xl border border-line bg-paper px-5 py-2.5 text-sm font-semibold hover:border-sage">View @{gate.owner_handle}</Link>
        </div>
      </main>
    </>
  );
}
