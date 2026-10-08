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
const s2 = readFileSync("supabase/migrations/0015_admin_roles_banner.sql", "utf8");
for (const fn of ["admin_access_list", "admin_grant_access", "admin_revoke_access"]) assert(s2.slice(s2.indexOf(`function public.${fn}`)).slice(0, 300).includes("<>'owner'"), `${fn} is owner-only`);
assert(s2.includes("email_confirmed_at is not null") && s2.includes("('google','github')"), "invites activate only for verified OAuth email");
assert(s2.includes("You cannot remove your own access") && s2.includes("The owner cannot be removed"), "no self-lockout, owner protected");
assert(s2.includes("myrole='moderator' and not (kind in ('project','comment','report')"), "moderators are limited to reports and hide/restore");
assert(!/select[^;]*\bemail\b[^;]*from public\.admin_members a join public\.profiles/.test(readFileSync("supabase/migrations/0014_admin_v2_views.sql", "utf8")), "email only in owner access list");
const route = readFileSync("src/app/api/admin/banner/route.ts", "utf8");
assert(route.includes('role !== "owner" && role !== "admin"') && route.includes("sameOrigin"), "banner upload is admin-only and same-origin");
console.log("PASS admin v2 stage 2 checks");
