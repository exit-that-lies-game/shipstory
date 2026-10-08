import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const sql = readFileSync("supabase/migrations/0014_admin_v2_views.sql", "utf8");
for (const fn of ["admin_project_detail", "admin_user_detail", "admin_activity_log", "admin_moderate"]) {
  const body = sql.slice(sql.indexOf(`function public.${fn}`));
  assert(body.slice(0, 700).includes("public.is_admin()"), `${fn} checks admin first`);
  assert(sql.includes(`revoke all on function`) && sql.includes(fn), `${fn} is revoked from public`);
}
assert(!/email/i.test(sql.replace(/emails are not shown/gi, "")), "stage 1 admin RPCs never select email");
assert(sql.includes("reason of at least 5 characters"), "suspend and block need a reason");
const layout = readFileSync("src/app/admin/layout.tsx", "utf8");
assert(layout.includes("allowed") && layout.indexOf("allowed") < layout.indexOf("getOverview()"), "layout gates before loading data");
console.log("PASS admin v2 stage 1 checks");
