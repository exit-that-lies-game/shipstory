import { getOverview } from "@/server/admin/data";
import { PageHead } from "@/components/admin/ui";
import { ReferencePanels } from "@/components/admin/ReferencePanels";
export default async function Content() { const d = (await getOverview())!; return <><PageHead title="Content" sub="Banners shown above the feed." /><ReferencePanels tab="content" d={d} /></>; }
