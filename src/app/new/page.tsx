import { redirect } from "next/navigation";
import { getViewer } from "@/lib/data";
import { AppNav } from "@/components/layout/AppNav";
import { Wizard } from "@/components/wizard/Wizard";

export const metadata = { title: "New project - ShipStory" };

export default async function NewProject() {
  if (!await getViewer()) redirect("/login?next=/new");
  return (
    <>
      <AppNav />
      <main id="main" className="mx-auto max-w-[1200px] px-5 py-10 lg:px-8"><Wizard /></main>
    </>
  );
}
