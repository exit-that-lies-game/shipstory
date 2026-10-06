import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "soft";
const styles: Record<Variant, string> = {
  primary: "bg-terracotta text-white hover:bg-[#ad4d30] shadow-[0_8px_18px_-8px_#c15a3a99]",
  ghost: "bg-paper text-ink border border-line hover:border-sage hover:bg-white",
  soft: "bg-[#e9eed9] text-olive border border-[#d3dcb9] hover:bg-[#dfe7c8]",
};
const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive";
const sizes = { sm: "px-3.5 py-2 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3.5 text-[15px]" };

type Props = { variant?: Variant; size?: keyof typeof sizes; href?: string; className?: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = "primary", size = "md", href, className = "", children, ...rest }: Props) {
  const cls = `${base} ${styles[variant]} ${sizes[size]} ${className}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button className={cls} {...rest}>{children}</button>;
}
