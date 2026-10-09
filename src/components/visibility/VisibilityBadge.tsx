import { Icon } from "@/components/ui/Icon";
import type { Visibility } from "@/shared/types";

export function VisibilityBadge({ v, className = "" }: { v?: Visibility; className?: string }) {
  if (!v || v === "public") return null;
  return <span className={`inline-flex items-center gap-1 label-mono border border-ink bg-paper px-2 py-0.5 text-ink ${className}`}><Icon name="lock" size={12} />{v === "followers" ? "Followers only" : "Private"}</span>;
}
