import Link from "next/link";
import type { ReactNode } from "react";
export const card = "border border-ink bg-paper p-5";
export function PageHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-ink pb-4"><div><p className="label-mono text-terracotta">Admin</p><h1 className="mt-1 text-4xl font-extrabold leading-none tracking-[-0.05em]">{title}</h1>{sub && <p className="mt-2 text-sm text-muted">{sub}</p>}</div>{right}</div>;
}
export function Stat({ label, value, note, warn }: { label: string; value: ReactNode; note?: string; warn?: boolean }) {
  return <div className={card}><p className="label-mono text-muted">{label}</p><p className={`mt-2 text-4xl font-extrabold tracking-[-0.04em] ${warn ? "text-terracotta" : ""}`}>{value}</p>{note && <p className="label-mono mt-2 normal-case tracking-normal text-ink">{note}</p>}</div>;
}
export function Chip({ children, tone = "ok" }: { children: ReactNode; tone?: "ok" | "warn" | "mute" }) {
  const c = tone === "warn" ? "border-terracotta bg-terracotta/10 text-terracotta" : tone === "mute" ? "border-line bg-cream text-muted" : "border-ink bg-sage text-ink";
  return <span className={`label-mono border px-2 py-0.5 ${c}`}>{children}</span>;
}
export function Tabs({ items, active }: { items: { key: string; label: string; href: string }[]; active: string }) {
  return <nav className="mb-5 flex flex-wrap border border-ink w-fit max-w-full overflow-x-auto">{items.map(i => <Link key={i.key} href={i.href} aria-current={i.key === active ? "page" : undefined} className={`label-mono border-r border-ink px-4 py-3 last:border-r-0 ${i.key === active ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-sage"}`}>{i.label}</Link>)}</nav>;
}
export function Empty({ label }: { label: string }) { return <div className="border border-dashed border-ink p-10 text-center text-muted">{label}</div>; }
export function SearchBox({ action, q, placeholder, hidden }: { action: string; q?: string; placeholder: string; hidden?: Record<string, string> }) {
  return <form action={action} className="mb-5 flex gap-3">{Object.entries(hidden ?? {}).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}<input aria-label={placeholder} name="q" defaultValue={q} maxLength={100} placeholder={placeholder} className="min-w-0 flex-1 border border-line bg-paper px-4 py-3 outline-none focus:border-ink focus:ring-1 focus:ring-ink" /><button className="label-mono border border-ink bg-ink px-5 text-paper hover:border-terracotta hover:bg-terracotta">Search</button></form>;
}
