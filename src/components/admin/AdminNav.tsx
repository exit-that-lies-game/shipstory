"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const items = [["Overview", "/admin"], ["Reports", "/admin/reports"], ["Projects", "/admin/projects"], ["Users", "/admin/users"], ["Activity", "/admin/activity"], ["Analytics", "/admin/analytics"], ["Content", "/admin/content"], ["Access", "/admin/access"]] as const;
export function AdminNav({ reports, role }: { reports: number; role: string }) {
  const path = usePathname();
  return <nav aria-label="Admin sections" className="flex flex-wrap lg:flex-col">{items.filter(([label]) => role === "owner" || (role === "admin" ? label !== "Access" : ["Overview", "Reports", "Projects", "Users", "Activity"].includes(label))).map(([label, href]) => {
    const on = href === "/admin" ? path === "/admin" : path.startsWith(href);
    return <Link key={href} href={href} aria-current={on ? "page" : undefined} className={`label-mono flex items-center justify-between border-l-2 px-4 py-3 ${on ? "border-terracotta text-terracotta" : "border-transparent text-muted hover:border-ink hover:text-ink"}`}>{label}{label === "Reports" && reports > 0 && <span className="ml-2 bg-terracotta px-2 text-paper">{reports}</span>}</Link>;
  })}</nav>;
}
