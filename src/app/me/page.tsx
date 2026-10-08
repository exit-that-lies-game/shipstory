import { redirect } from "next/navigation";
import { getViewer } from "@/server/data";

export default async function Me() {
  const viewer = await getViewer();
  redirect(viewer ? `/u/${viewer.handle}` : "/login?next=/me");
}
