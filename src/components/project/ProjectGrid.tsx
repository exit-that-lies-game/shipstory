import type { Project } from "@/server/data";
import { ProjectCard } from "./ProjectCard";

export function ProjectGrid({ projects, showOwner = true, cols = 3, empty = "Nothing here yet.", layout = "grid" }: { projects: Project[]; showOwner?: boolean; cols?: 2 | 3; empty?: string; layout?: "grid" | "list" }) {
  if (!projects.length) {
    return <div className="rounded-2xl border border-dashed border-line bg-paper p-12 text-center text-muted">{empty}</div>;
  }
  if (layout === "list") return <div className="flex flex-col gap-5">{projects.map((p) => <ProjectCard key={p.id} project={p} showOwner={showOwner} layout="list" />)}</div>;
  const grid = cols === 3 ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className={`grid gap-6 ${grid}`}>
      {projects.map((p) => <ProjectCard key={p.id} project={p} showOwner={showOwner} />)}
    </div>
  );
}
