import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { VisibilityBadge } from "@/components/visibility/VisibilityBadge";
import type { Project } from "@/server/data";

export function ProjectCard({ project, tilt = 0, showOwner = true, layout = "grid" }: { project: Project; tilt?: number; showOwner?: boolean; layout?: "grid" | "list" }) {
  const host = project.demoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const row = layout === "list";
  const meta = (
    <div className={`flex items-center justify-between gap-3 text-xs text-muted ${row ? "mt-3" : "mt-4"}`}>
      {showOwner ? <span className="flex min-w-0 items-center gap-2"><Avatar name={project.owner.name} src={project.owner.avatarUrl} size={26} /><span className="truncate">{project.owner.handle}</span></span> : <span />}
      <span className="flex shrink-0 items-center gap-4"><span className="flex items-center gap-1.5"><Icon name="comment" size={15} />{project.comments}</span><span className="flex items-center gap-1.5" title={`${project.saves} saves`}><Icon name="bookmark" size={15} /></span></span>
    </div>
  );
  return (
    <Link
      href={`/p/${project.slug}`}
      className={`group block overflow-hidden rounded-3xl border border-[#efe9d6] bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift ${row ? "sm:flex sm:items-stretch" : ""}`}
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
    >
      <div className={`p-3 ${row ? "sm:w-[300px] sm:shrink-0" : ""}`}>
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-sage/30">
          <Image src={project.cover} alt={`${project.title} screenshot`} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
          <VisibilityBadge v={project.visibility} className="absolute right-3 top-3" />
          <span className="absolute bottom-3 left-3 max-w-[85%] truncate rounded-lg bg-[#faf7edeb] px-3 py-1.5 font-mono text-[11px] font-medium text-ink shadow-sm">{host}</span>
        </div>
      </div>
      <div className={`px-5 pb-5 ${row ? "flex flex-1 flex-col justify-center pt-2 sm:pt-5" : "pt-2"}`}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[19px] font-bold tracking-tight">{project.title}</h3>
          <span className="flex items-center gap-1 rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold text-terracotta"><Icon name="heart" size={13} filled />{project.likes}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-[15px] font-medium text-ink/80">{project.pitch}</p>
        {project.description && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{project.description}</p>}
        {meta}
      </div>
    </Link>
  );
}
