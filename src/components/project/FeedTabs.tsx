import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

// Segmented control with shared borders, plus the grid/list switch. Layout lives in the URL so the page stays server-rendered.
export function FeedTabs({ sort, tag, q, following = false, layout = "grid", count }: { sort: string; tag?: string; q?: string; following?: boolean; layout?: "grid" | "list"; count: number }) {
  const href = (over: { sort?: string; layout?: string; following?: boolean }) => {
    const p = new URLSearchParams();
    if (over.following) p.set("view", "following"); else p.set("sort", over.sort ?? sort);
    if (tag) p.set("tag", tag);
    if (q) p.set("q", q);
    if ((over.layout ?? layout) === "list") p.set("layout", "list");
    return `/feed?${p}`;
  };
  const tab = (on: boolean) => `label-mono inline-flex shrink-0 items-center gap-2 border-r border-ink px-5 py-3 transition-colors last:border-r-0 ${on ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-sage"}`;
  const sw = (on: boolean) => `grid h-10 w-10 place-items-center border-r border-ink transition-colors last:border-r-0 ${on ? "bg-sage text-ink" : "bg-paper text-ink hover:bg-sage"}`;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex max-w-full items-stretch overflow-x-auto border border-ink [scrollbar-width:none]">
        <Link href={href({ sort: "trending" })} aria-current={!following && sort === "trending" ? "page" : undefined} className={tab(!following && sort === "trending")}>{!following && sort === "trending" && <span className="h-2 w-2 bg-sage" aria-hidden />}Trending</Link>
        <Link href={href({ sort: "latest" })} aria-current={!following && sort === "latest" ? "page" : undefined} className={tab(!following && sort === "latest")}>Latest</Link>
        <Link href={href({ following: true })} aria-current={following ? "page" : undefined} className={tab(following)}>Following</Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="label-mono text-muted">{String(count).padStart(2, "0")} {count === 1 ? "project" : "projects"}</span>
        <div className="flex border border-ink" role="group" aria-label="Layout">
          <Link href={href({ layout: "grid", following, sort })} aria-label="Grid view" aria-pressed={layout === "grid"} className={sw(layout === "grid")}><Icon name="grid" size={17} /></Link>
          <Link href={href({ layout: "list", following, sort })} aria-label="List view" aria-pressed={layout === "list"} className={sw(layout === "list")}><Icon name="list" size={17} /></Link>
        </div>
      </div>
    </div>
  );
}
