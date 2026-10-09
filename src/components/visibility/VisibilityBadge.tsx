import { Icon } from "@/components/ui/Icon";
import type { Visibility } from "@/shared/types";

export function VisibilityBadge({ v, className = "" }: { v?: Visibility; className?: string }) {
  if (!v || v === "public") return null;
  return <span className={`inline-flex items-center gap-1 rounded-full border border-line bg-[#faf7edeb] px-2.5 py-0.5 text-[11px] font-semibold text-olive ${className}`}><Icon name="lock" size={12} />{v === "followers" ? "Followers only" : "Private"}</span>;
}
