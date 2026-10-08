import { getOverview } from "@/server/admin/data";
import { PageHead } from "@/components/admin/ui";
import { ReferencePanels } from "@/components/admin/ReferencePanels";
export default async function Analytics() { const d = (await getOverview())!; return <><PageHead title="Analytics" sub="Real counts from ShipStory data. No visitor tracking is connected." /><ReferencePanels tab="analytics" d={d} /></>; }
