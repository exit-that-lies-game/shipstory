import Link from "next/link";
import type { ReactNode } from "react";

export function Chip({ children, active = false, href, className = "" }: { children: ReactNode; active?: boolean; href?: string; className?: string }) {
  const cls = `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${active ? "border-olive bg-[#e9eed9] text-olive" : "border-line bg-paper text-muted hover:border-sage"} ${className}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <span className={cls}>{children}</span>;
}
