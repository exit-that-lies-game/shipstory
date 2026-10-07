import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { SearchBox } from "./SearchBox";
import { adminAccess } from "@/lib/admin/access";
import { getViewer } from "@/lib/data";

const links = [
  { href: "/feed", label: "Home", key: "home" },
  { href: "/feed?sort=latest", label: "Explore", key: "explore" },
  { href: "/feed?view=following", label: "Following", key: "following" },
  { href: "/saved", label: "Saved", key: "saved" },
];

export async function AppNav({ active, q }: { active?: string; q?: string }) {
  const viewer = await getViewer();
  const admin = viewer ? (await adminAccess()).allowed : false;
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[#faf7edee] backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center gap-6 px-5 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {links.map((l) => (
            <Link key={l.key} href={l.href} className={active === l.key ? "text-terracotta" : "text-muted hover:text-ink"}>{l.label}</Link>
          ))}
        </nav>
        <div className="mx-auto hidden flex-1 justify-center md:flex"><SearchBox defaultValue={q} /></div>
        <div className="ml-auto flex items-center gap-3 md:ml-0">
          {admin && <Link href="/admin" className="text-xs font-semibold text-olive">Admin</Link>}
          <Button href="/new" size="sm"><Icon name="plus" size={16} /><span className="hidden sm:inline">New project</span></Button>
          <button aria-label="Notifications" className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-[#e9eed9]"><Icon name="bell" /></button>
          {viewer ? <Link href="/me" aria-label="Your profile"><Avatar name={viewer.name} size={34} /></Link> : <Button href="/login" size="sm" variant="ghost" className="whitespace-nowrap">Sign in</Button>}
        </div>
      </div>
    </header>
  );
}
