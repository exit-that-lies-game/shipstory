import Link from "next/link";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/layout/AppNav";
import { adminAccess } from "@/server/admin/access";
import { getOverview } from "@/server/admin/data";
import { AdminNav } from "@/components/admin/AdminNav";
export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, allowed, role } = await adminAccess();
  if (!user) redirect("/login?next=/admin");
  if (!allowed) return <><AppNav /><main id="main" className="mx-auto max-w-xl px-5 py-20"><h1 className="text-3xl font-extrabold">Admin access only</h1><p className="mt-3 text-muted">This account does not have access to ShipStory administration.</p><Link className="mt-5 inline-block text-terracotta" href="/feed">Back to feed</Link></main></>;
  const d = await getOverview();
  if (!d) return <><AppNav /><main className="p-10"><h1 className="text-2xl font-bold">Admin data unavailable</h1><p role="alert" className="mt-3">Refresh to try again. No changes have been made.</p></main></>;
  return <><AppNav /><main id="main" className="mx-auto max-w-[1400px] px-5 py-8 lg:px-8">
    <div className="grid gap-6 lg:grid-cols-[210px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border border-line bg-paper p-3 shadow-soft"><AdminNav reports={d.counts.reports} role={role!} /><p className="mt-5 hidden border-t border-line px-4 pt-4 text-xs leading-relaxed text-muted lg:block">Private preview<br />No public launch yet.</p></aside>
      <section className="min-w-0">{children}</section>
    </div></main></>;
}
