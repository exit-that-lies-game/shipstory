"use client";
import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { DoodleIcon } from "./DoodleIcons";

/** Back link with a hand-drawn arrow that stretches out on hover. */
export function DoodleBack({ href, label }: { href: string; label: string }) {
  const arrow = useRef<HTMLSpanElement>(null);
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <Link
      href={href}
      onMouseEnter={() => !reduced() && gsap.to(arrow.current, { x: -8, scaleX: 1.25, duration: 0.35, ease: "back.out(2.5)", transformOrigin: "100% 50%" })}
      onMouseLeave={() => !reduced() && gsap.to(arrow.current, { x: 0, scaleX: 1, duration: 0.5, ease: "elastic.out(1,0.4)" })}
      className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink"
    >
      <span ref={arrow} className="inline-block text-ink"><DoodleIcon name="arrow" size={26} /></span>
      {label}
    </Link>
  );
}
