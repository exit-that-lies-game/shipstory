import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { VisibilityBadge } from "@/components/visibility/VisibilityBadge";
import type { Draft } from "./types";

export function PreviewCard({ d }: { d: Draft }) {
  const host = d.demoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "") || "yourproject.com";
  return (
    <div className="rounded-3xl border border-line bg-[#f4f0e0] p-5">
      <p className="mb-3 text-sm font-bold">Preview</p>
      <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-soft">
        <div className="relative aspect-[16/10] bg-gradient-to-br from-sage/60 to-[#e9eed9]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {d.coverPreview && <img src={d.coverPreview} alt="Cover preview" className="h-full w-full object-cover" />}
          <VisibilityBadge v={d.visibility} className="absolute right-3 top-3" />
          <span className="absolute bottom-3 left-3 rounded-md bg-[#faf7edeb] px-2.5 py-1 font-mono text-[11px]">{host}</span>
        </div>
        <div className="p-4">
          <div className="flex justify-between"><b className="text-[17px]">{d.title || "Project name"}</b><span className="flex items-center gap-1 text-xs font-semibold text-terracotta"><Icon name="heart" size={13} filled />0</span></div>
          <p className="mt-1 text-sm text-muted">{d.pitch || "Your one-line pitch shows here."}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted"><Avatar name="You" size={22} />you</div>
        </div>
      </div>
    </div>
  );
}
