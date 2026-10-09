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
  const item = (on: boolean) => `flex items-center gap-3 border-l-2 px-3.5 py-2.5 text-sm font-semibold transition-colors ${on ? "border-terracotta text-terracotta" : "border-transparent text-muted hover:border-ink hover:text-ink"}`;
  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-[92px] space-y-1">
        {main.map((l) => (
          <Link key={l.key} href={l.href} className={item(active === l.key)}><Icon name={l.icon} size={18} />{l.label}</Link>
        ))}
        <p className="label-mono border-t border-line px-3.5 pb-2 pt-6 mt-6 text-muted">Topics</p>
        {topics.map((t) => (
          <Link key={t} href={`/feed?tag=${encodeURIComponent(t)}`} className={item(activeTag === t)}><Icon name={topicIcons[t] ?? "tag"} size={18} />{t}</Link>
        ))}
        <Link href="/analytics" className="mt-8 flex items-center gap-3 border border-ink bg-sage p-3.5 transition hover:bg-paper">
          <span className="grid h-9 w-9 shrink-0 place-items-center bg-ink text-sage"><Icon name="bolt" size={18} /></span>
          <span className="min-w-0 flex-1"><b className="block text-[13px]">Project signals</b><span className="block text-[11px] leading-snug text-ink/70">See who opened, reacted and followed.</span></span>
          <Icon name="arrow" size={14} className="text-ink" />
        </Link>
      </div>
    </aside>
  );
}
