import Link from "next/link";
import type { ReactNode } from "react";
export const card = "rounded-2xl border border-line bg-paper p-5 shadow-soft";
export function PageHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>{sub && <p className="mt-1 text-sm text-muted">{sub}</p>}</div>{right}</div>;
}
export function Stat({ label, value, note, warn }: { label: string; value: ReactNode; note?: string; warn?: boolean }) {
  return <div className={card}><p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p><p className={`mt-2 text-3xl font-extrabold ${warn ? "text-terracotta" : ""}`}>{value}</p>{note && <p className="mt-1 text-xs text-olive">{note}</p>}</div>;
}
export function Chip({ children, tone = "ok" }: { children: ReactNode; tone?: "ok" | "warn" | "mute" }) {
  const c = tone === "warn" ? "bg-[#f3e3dc] text-terracotta" : tone === "mute" ? "bg-[#eee9d6] text-muted" : "bg-[#e9eed9] text-olive";
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${c}`}>{children}</span>;
}
export function Tabs({ items, active }: { items: { key: string; label: string; href: string }[]; active: string }) {
  return <nav className="mb-5 flex flex-wrap gap-2">{items.map(i => <Link key={i.key} href={i.href} aria-current={i.key === active ? "page" : undefined} className={`rounded-full border px-4 py-2 text-sm font-semibold ${i.key === active ? "border-[#e9eed9] bg-[#e9eed9] text-olive" : "border-line bg-paper text-muted hover:bg-cream"}`}>{i.label}</Link>)}</nav>;
}
export function Empty({ label }: { label: string }) { return <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">{label}</div>; }
export function SearchBox({ action, q, placeholder, hidden }: { action: string; q?: string; placeholder: string; hidden?: Record<string, string> }) {
  return <form action={action} className="mb-5 flex gap-3">{Object.entries(hidden ?? {}).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}<input aria-label={placeholder} name="q" defaultValue={q} maxLength={100} placeholder={placeholder} className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-4 py-3 outline-none focus:ring-2 focus:ring-sage" /><button className="rounded-xl bg-olive px-5 text-sm font-semibold text-white">Search</button></form>;
}
