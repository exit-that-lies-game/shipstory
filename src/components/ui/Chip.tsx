import Link from "next/link";
import type { ReactNode } from "react";

export function Chip({ children, active = false, href, className = "" }: { children: ReactNode; active?: boolean; href?: string; className?: string }) {
  const cls = `label-mono inline-flex items-center gap-1.5 border px-3 py-1.5 transition-colors ${active ? "border-ink bg-ink text-paper" : "border-line bg-paper text-muted hover:border-ink hover:text-ink"} ${className}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <span className={cls}>{children}</span>;
}
