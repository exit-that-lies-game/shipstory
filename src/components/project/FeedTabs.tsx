import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

// Pill tabs plus the grid/list switch, as in the feed design. Layout lives in the URL so the page stays server-rendered.
export function FeedTabs({ sort, tag, q, following = false, layout = "grid", count }: { sort: string; tag?: string; q?: string; following?: boolean; layout?: "grid" | "list"; count: number }) {
  const href = (over: { sort?: string; layout?: string; following?: boolean }) => {
    const p = new URLSearchParams();
    if (over.following) p.set("view", "following"); else p.set("sort", over.sort ?? sort);
    if (tag) p.set("tag", tag);
    if (q) p.set("q", q);
    if ((over.layout ?? layout) === "list") p.set("layout", "list");
    return `/feed?${p}`;
  };
  const tab = (on: boolean) => `inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-colors ${on ? "bg-paper text-ink shadow-soft" : "text-muted hover:text-ink"}`;
  const sw = (on: boolean) => `grid h-10 w-10 place-items-center rounded-xl transition-colors ${on ? "bg-paper text-terracotta shadow-soft" : "text-muted hover:text-ink"}`;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-1.5 rounded-[20px] bg-[#f3efe0] p-1.5">
        <Link href={href({ sort: "trending" })} className={tab(!following && sort === "trending")}>{!following && sort === "trending" && <span className="h-2.5 w-2.5 rounded-full bg-terracotta" />}Trending</Link>
        <Link href={href({ sort: "latest" })} className={tab(!following && sort === "latest")}>Latest</Link>
        <Link href={href({ following: true })} className={tab(following)}>Following</Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted">{count} {count === 1 ? "project" : "projects"}</span>
        <div className="flex gap-1 rounded-2xl bg-[#f3efe0] p-1" role="group" aria-label="Layout">
          <Link href={href({ layout: "grid", following, sort })} aria-label="Grid view" aria-pressed={layout === "grid"} className={sw(layout === "grid")}><Icon name="grid" size={17} /></Link>
          <Link href={href({ layout: "list", following, sort })} aria-label="List view" aria-pressed={layout === "list"} className={sw(layout === "list")}><Icon name="list" size={17} /></Link>
        </div>
      </div>
    </div>
  );
}
