import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";

const main: { href: string; label: string; icon: IconName; key: string }[] = [
  { href: "/feed", label: "Home", icon: "home", key: "home" },
  { href: "/feed?sort=latest", label: "Explore", icon: "compass", key: "explore" },
  { href: "/feed?view=following", label: "Following", icon: "users", key: "following" },
  { href: "/saved", label: "Saved", icon: "bookmark", key: "saved" },
  { href: "/me", label: "My projects", icon: "folder", key: "mine" },
];

const topicIcons: Record<string, IconName> = { Web: "code", Mobile: "grid", AI: "bolt", Games: "play", "Dev tools": "tag" };

export function Sidebar({ active, activeTag, topics }: { active?: string; activeTag?: string; topics: string[] }) {
  const item = (on: boolean) => `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${on ? "bg-[#fbebe3] text-terracotta" : "text-muted hover:bg-[#f1eedd] hover:text-ink"}`;
  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-[92px] space-y-1">
        {main.map((l) => (
          <Link key={l.key} href={l.href} className={item(active === l.key)}><Icon name={l.icon} size={18} />{l.label}</Link>
        ))}
        <p className="px-3.5 pb-1 pt-7 text-[11px] font-semibold uppercase tracking-widest text-[#9a9b86]">Topics</p>
        {topics.map((t) => (
          <Link key={t} href={`/feed?tag=${encodeURIComponent(t)}`} className={item(activeTag === t)}><Icon name={topicIcons[t] ?? "tag"} size={18} />{t}</Link>
        ))}
        <Link href="/analytics" className="mt-8 flex items-center gap-3 rounded-2xl border border-line bg-paper p-3.5 shadow-soft transition hover:border-sage">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fbf0d4] text-[#c9962b]"><Icon name="bolt" size={18} /></span>
          <span className="min-w-0 flex-1"><b className="block text-[13px]">Ship faster</b><span className="block text-[11px] leading-snug text-muted">Get insights, analytics and more.</span></span>
          <Icon name="arrow" size={14} className="text-muted" />
        </Link>
      </div>
    </aside>
  );
}
