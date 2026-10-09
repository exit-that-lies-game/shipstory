import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "soft";
const styles: Record<Variant, string> = {
  primary: "border border-ink bg-ink text-paper hover:border-terracotta hover:bg-terracotta",
  ghost: "border border-ink bg-paper text-ink hover:bg-sage",
  soft: "border border-ink bg-sage text-ink hover:bg-paper",
};
const base = "inline-flex items-center justify-center gap-2 font-mono font-semibold uppercase tracking-[0.08em] transition-colors duration-150 cursor-pointer disabled:opacity-50";
const sizes = { sm: "px-3.5 py-2 text-[11px]", md: "px-5 py-2.5 text-xs", lg: "px-6 py-3.5 text-xs" };

type Props = { variant?: Variant; size?: keyof typeof sizes; href?: string; className?: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = "primary", size = "md", href, className = "", children, ...rest }: Props) {
  const cls = `${base} ${styles[variant]} ${sizes[size]} ${className}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button className={cls} {...rest}>{children}</button>;
}
