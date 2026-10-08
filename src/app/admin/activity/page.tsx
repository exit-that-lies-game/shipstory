import { rpcJson, when } from "@/server/admin/data";
import type { AdminLogEntry } from "@/shared/admin-types";
import { PageHead, Empty, card } from "@/components/admin/ui";
import { ModerationControl } from "@/components/admin/ModerationControl";
const undo: Record<string, string> = { hide: "restore", block: "unblock", suspend: "unsuspend", verify: "unverify", publish: "unpublish" };
export default async function Activity() {
  const log = (await rpcJson<AdminLogEntry[]>("admin_activity_log", {})) ?? [];
  return <>
    <PageHead title="Activity" sub="Every admin action: who did it, when, why. Undo where it makes sense." />
    <div className={card}>{log.map((a, i) => <div key={i} className="flex flex-wrap items-start justify-between gap-3 border-t border-line py-3 first:border-0 text-sm">
      <span><b className="capitalize">{a.action} {a.target_kind}</b>{a.label ? ` · ${a.label}` : ""}<br /><span className="text-xs text-muted">by {a.admin ? `@${a.admin}` : "admin"}{a.reason ? ` · reason: ${a.reason}` : ""}</span></span>
      <span className="flex items-start gap-3"><time className="text-xs text-muted">{when(a.created_at)}</time>{undo[a.action] && ["project", "comment", "builder", "announcement"].includes(a.target_kind) && <ModerationControl kind={a.target_kind} target={a.target_id} decision={undo[a.action]} label="Undo" />}</span></div>)}{!log.length && <Empty label="No admin actions yet." />}</div>
  </>;
}
