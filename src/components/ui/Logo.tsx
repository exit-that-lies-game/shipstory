import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 text-[22px] font-extrabold tracking-tight">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-terracotta text-white" aria-hidden>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14zM5 19l7-7" /></svg>
      </span>
      <span>Ship<span className="text-terracotta">Story</span></span>
    </Link>
  );
}
