import Link from "next/link";

export function Logo({ href = "/", dark = false }: { href?: string; dark?: boolean }) {
  return (
    <Link href={href} className="group flex items-center gap-2.5 text-[22px] font-extrabold tracking-[-0.04em]">
      <span className={`grid h-8 w-8 place-items-center transition-transform duration-200 group-hover:rotate-6 ${dark ? "bg-paper text-ink" : "bg-ink text-paper"}`} aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"><path d="M4 7h9M4 12h6M4 17h9" /><path d="M14 12h6m-3-3 3 3-3 3" stroke="#ef5b3d" /></svg>
      </span>
      <span>Ship<span className="story-serif text-terracotta">Story</span></span>
    </Link>
  );
}
