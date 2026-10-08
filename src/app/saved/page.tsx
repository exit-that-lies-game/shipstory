import { AppNav } from "@/components/layout/AppNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { listSaved, listTopics } from "@/server/data";

export default async function Saved() {
  const [projects, topics] = await Promise.all([listSaved(), listTopics()]);
  return (
    <>
      <AppNav active="saved" />
      <div className="mx-auto flex max-w-[1400px] gap-8 px-5 py-8 lg:px-8">
        <Sidebar active="saved" topics={topics} />
        <main id="main" className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Saved</h1>
          <p className="mb-6 text-sm text-muted">Projects you bookmarked to come back to.</p>
          <ProjectGrid projects={projects} />
        </main>
      </div>
    </>
  );
}
