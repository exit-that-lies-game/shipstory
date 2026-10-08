"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const items = [["Overview", "/admin"], ["Reports", "/admin/reports"], ["Projects", "/admin/projects"], ["Users", "/admin/users"], ["Activity", "/admin/activity"], ["Analytics", "/admin/analytics"], ["Content", "/admin/content"], ["Access", "/admin/access"]] as const;
export function AdminNav({ reports, role }: { reports: number; role: string }) {
  const path = usePathname();
  return <nav aria-label="Admin sections" className="flex flex-wrap gap-2 lg:flex-col">{items.filter(([label]) => role === "owner" || (role === "admin" ? label !== "Access" : ["Overview", "Reports", "Projects", "Users", "Activity"].includes(label))).map(([label, href]) => {
    const on = href === "/admin" ? path === "/admin" : path.startsWith(href);
    return <Link key={href} href={href} aria-current={on ? "page" : undefined} className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold ${on ? "bg-[#e9eed9] text-olive" : "text-muted hover:bg-cream"}`}>{label}{label === "Reports" && reports > 0 && <span className="ml-2 rounded-full bg-terracotta px-2 text-[11px] text-white">{reports}</span>}</Link>;
  })}</nav>;
}
