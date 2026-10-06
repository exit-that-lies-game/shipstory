import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import type { Project } from "@/lib/data";

export function ProjectCard({ project, tilt = 0, showOwner = true }: { project: Project; tilt?: number; showOwner?: boolean }) {
  const host = project.demoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <Link
      href={`/p/${project.slug}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-paper shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift"
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-sage/30">
        <Image src={project.cover} alt={`${project.title} screenshot`} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
        <span className="absolute bottom-3 left-3 rounded-md bg-[#faf7edeb] px-2.5 py-1 font-mono text-[11px] font-medium text-ink shadow-sm">{host}</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-bold tracking-tight">{project.title}</h3>
          <span className="flex items-center gap-1 rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold text-terracotta"><Icon name="heart" size={13} filled />{project.likes}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{project.pitch}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted">
          {showOwner ? <span className="flex items-center gap-2"><Avatar name={project.owner.name} size={22} />{project.owner.handle}</span> : <span />}
          <span>{project.comments} comments &middot; {project.saves} saves</span>
        </div>
      </div>
    </Link>
  );
}
