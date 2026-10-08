import "server-only";
import { cache } from "react";
import { adminAccess } from "./access";
import type { AdminData } from "@/shared/admin-types";

// One admin_overview call per request, shared by the layout and the page.
export const getOverview = cache(async (): Promise<AdminData | null> => {
  const { sb, allowed } = await adminAccess();
  if (!allowed) return null;
  const { data, error } = await sb.rpc("admin_overview");
  return error || !data ? null : (data as AdminData);
});

export async function rpcJson<T>(fn: string, args: Record<string, string>): Promise<T | null> {
  const { sb, allowed } = await adminAccess();
  if (!allowed) return null;
  const { data, error } = await sb.rpc(fn, args);
  return error || !data ? null : (data as T);
}
export const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);
export const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "never");
export const olderThanDay = (iso: string) => Date.now() - new Date(iso).getTime() > 86400000;
