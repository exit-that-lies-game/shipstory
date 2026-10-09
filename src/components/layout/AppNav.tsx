import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { AccountMenu } from "./AccountMenu";
import { SearchBox } from "./SearchBox";
import { adminAccess } from "@/server/admin/access";
import { supabaseConfigured } from "@/lib/supabase/client";
import { getViewer } from "@/server/data";

const links = [
  { href: "/feed", label: "Home", key: "home" },
  { href: "/feed?sort=latest", label: "Explore", key: "explore" },
  { href: "/feed?view=following", label: "Following", key: "following" },
  { href: "/saved", label: "Saved", key: "saved" },
];

export async function AppNav({ active, q, bare = false }: { active?: string; q?: string; bare?: boolean }) {
  const viewer = await getViewer();
  const admin = viewer && supabaseConfigured ? (await adminAccess()).allowed : false;
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[#faf7edee] backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center gap-3 px-4 sm:gap-6 sm:px-5 lg:px-8">
        <Logo href="/feed" />
        {!bare && <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {links.map((l) => (
            <Link key={l.key} href={l.href} className={active === l.key ? "text-terracotta" : "text-muted hover:text-ink"}>{l.label}</Link>
          ))}
        </nav>}
        <div className={`mx-auto hidden flex-1 justify-center md:flex ${bare ? "max-w-2xl" : ""}`}><SearchBox defaultValue={q} wide={bare} /></div>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-3 md:ml-0">
          {viewer && <Link href="/analytics" className="hidden text-xs font-semibold text-olive sm:inline">Analytics</Link>}
          {admin && <Link href="/admin" className="text-xs font-semibold text-olive">Admin</Link>}
          <Link href="/search" aria-label="Search" className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-[#e9eed9] md:hidden"><Icon name="search" /></Link>
          {!viewer?.suspended && <Button href="/new" size="sm"><Icon name="plus" size={16} /><span className="hidden sm:inline">New project</span></Button>}
          <Link href="/notifications" aria-label="Notifications" className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-[#e9eed9]"><Icon name="bell" /></Link>
          {viewer ? <AccountMenu name={viewer.name} avatarUrl={viewer.avatarUrl}/> : <Button href="/login" size="sm" variant="ghost" className="whitespace-nowrap">Sign in</Button>}
        </div>
      </div>
      {viewer?.suspended && <div role="alert" className="border-t border-[#e8b9a8] bg-[#fbeee8] px-4 py-2.5 text-center text-sm font-medium text-[#9a3f25]">Account suspended. You can still browse, but you cannot post. Please contact the admin.</div>}
    </header>
  );
}
