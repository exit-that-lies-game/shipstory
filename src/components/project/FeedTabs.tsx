import { Chip } from "@/components/ui/Chip";

export function FeedTabs({ sort, tag, q }: { sort: string; tag?: string; q?: string }) {
  const href = (s: string) => {
    const p = new URLSearchParams();
    p.set("sort", s);
    if (tag) p.set("tag", tag);
    if (q) p.set("q", q);
    return `/feed?${p}`;
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Chip href={href("trending")} active={sort === "trending"}>Trending</Chip>
      <Chip href={href("latest")} active={sort === "latest"}>Latest</Chip>
      <Chip href="/feed?view=following">Following</Chip>
    </div>
  );
}
