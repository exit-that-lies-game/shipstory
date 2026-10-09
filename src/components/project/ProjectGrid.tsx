import Link from "next/link";
import type { Project } from "@/server/data";
import { ProjectCard } from "./ProjectCard";

export function ProjectGrid({ projects, showOwner = true, cols = 3, empty = "Nothing here yet.", layout = "grid", numbered = false }: { projects: Project[]; showOwner?: boolean; cols?: 2 | 3; empty?: string; layout?: "grid" | "list"; numbered?: boolean }) {
  if (!projects.length) {
    return <div className="border border-dashed border-ink bg-paper p-12 text-center text-muted">{empty}</div>;
  }
  const num = (i: number) => (numbered ? i + 1 : undefined);
  if (layout === "list") return <div className="flex flex-col gap-4">{projects.map((p, i) => <ProjectCard key={p.id} project={p} showOwner={showOwner} layout="list" index={num(i)} />)}</div>;
  const grid = cols === 3 ? "sm:grid-cols-2 min-[1700px]:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className={`grid border-l border-t border-ink ${grid}`}>
      {projects.map((p, i) => <ProjectCard key={p.id} project={p} showOwner={showOwner} index={num(i)} />)}
      {numbered && projects.length < 3 && (
        <Link href="/new" className="group flex min-h-[260px] flex-col justify-between border-b border-r border-ink bg-sage p-6 transition-colors hover:bg-paper">
          <span className="label-mono">Dispatch {String(projects.length + 1).padStart(2, "0")} · open</span>
          <span><span className="block text-3xl font-extrabold leading-[0.95] tracking-[-0.05em]">The next ship is <span className="story-serif text-terracotta">yours.</span></span><span className="label-mono mt-4 inline-block border border-ink bg-ink px-4 py-2.5 text-paper group-hover:bg-terracotta">Start your project log</span></span>
        </Link>
      )}
    </div>
  );
}
