import Link from "next/link";
import { CoverFallback } from "./CoverFallback";
import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { VisibilityBadge } from "@/components/visibility/VisibilityBadge";
import type { Project } from "@/server/data";

// A project shown as a dispatch: flush image, optional order number, live-domain strip, then the record.
export function ProjectCard({ project, showOwner = true, layout = "grid", index }: { tilt?: number; project: Project; showOwner?: boolean; layout?: "grid" | "list"; index?: number }) {
  const host = project.demoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const row = layout === "list";
  return (
    <Link
      href={`/p/${project.slug}`}
      className={`group block overflow-hidden bg-paper transition-colors hover:bg-white ${row ? "border border-ink sm:flex sm:items-stretch" : "border-b border-r border-ink"}`}
    >
      <div className={`relative aspect-[16/10] overflow-hidden border-b border-ink bg-sage/30 ${row ? "sm:w-[300px] sm:shrink-0 sm:border-b-0 sm:border-r" : ""}`}>
        {project.cover ? <Image src={project.cover} alt={`${project.title} screenshot`} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" /> : <CoverFallback title={project.title} />}
        {index !== undefined && <span className="label-mono absolute left-0 top-0 bg-sage px-2.5 py-1.5 text-ink">Dispatch {String(index).padStart(2, "0")}</span>}
        <VisibilityBadge v={project.visibility} className="absolute right-2 top-2" />
        <span className="label-mono absolute inset-x-0 bottom-0 truncate bg-ink px-3 py-1.5 text-paper">Live · {host}</span>
      </div>
      <div className={`flex flex-1 flex-col p-5 ${row ? "justify-center" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[22px] font-extrabold leading-tight tracking-[-0.035em]">{project.title}</h3>
          <span className="label-mono flex shrink-0 items-center gap-1 border border-ink px-2 py-1 text-terracotta"><Icon name="heart" size={12} filled />{project.likes}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-[15px] font-semibold leading-snug">{project.pitch}</p>
        {project.description && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{project.description}</p>}
        {project.tags.length > 0 && <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Technologies">{project.tags.slice(0, 3).map((t) => <li key={t} className="label-mono border border-line px-2 py-0.5 text-muted">{t}</li>)}</ul>}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3 text-xs text-muted">
          {showOwner ? <span className="flex min-w-0 items-center gap-2"><Avatar name={project.owner.name} src={project.owner.avatarUrl} size={24} /><span className="truncate">{project.owner.handle}</span></span> : <span />}
          <span className="flex shrink-0 items-center gap-4"><span className="flex items-center gap-1.5"><Icon name="comment" size={15} />{project.comments}</span><span className="flex items-center gap-1.5" title={`${project.saves} saves`}><Icon name="bookmark" size={15} />{project.saves}</span></span>
        </div>
        <span className="label-mono mt-4 inline-flex w-full items-center justify-center gap-2 border border-ink bg-ink px-4 py-2.5 text-paper transition-colors group-hover:border-terracotta group-hover:bg-terracotta sm:w-auto sm:self-start">View project<Icon name="arrow" size={13} className="transition-transform group-hover:translate-x-0.5" /></span>
      </div>
    </Link>
  );
}
