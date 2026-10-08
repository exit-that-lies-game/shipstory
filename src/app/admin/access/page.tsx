import { getOverview } from "@/server/admin/data";
import { PageHead } from "@/components/admin/ui";
import { ReferencePanels } from "@/components/admin/ReferencePanels";
export default async function Access() { const d = (await getOverview())!; return <><PageHead title="Access" sub="Who can use this admin." /><ReferencePanels tab="access" d={d} /></>; }
