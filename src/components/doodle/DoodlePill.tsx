"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { DoodleIcon, type DoodleName } from "./DoodleIcons";

const SHATTER_AFTER = 4;

/**
 * A pill with a hand-drawn icon. Hovering wobbles the letters.
 * Clicking "hits" them: after a few hits the letters scatter and spring back.
 */
export function DoodlePill({ icon, label, hint }: { icon: DoodleName; label: string; hint?: string }) {
  const root = useRef<HTMLButtonElement>(null);
  const hits = useRef(0);
  const busy = useRef(false);

  const letters = () => Array.from(root.current?.querySelectorAll<HTMLElement>("[data-letter]") ?? []);
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function wobble() {
    if (reduced() || busy.current) return;
    gsap.fromTo(
      letters(),
      { x: () => gsap.utils.random(-2, 2), y: () => gsap.utils.random(-4, 2), rotation: () => gsap.utils.random(-8, 8) },
      { x: 0, y: 0, rotation: 0, duration: 0.5, stagger: 0.025, ease: "elastic.out(1,0.35)" },
    );
  }

  function hit() {
    if (reduced() || busy.current) return;
    hits.current += 1;
    const icon = root.current?.querySelector("svg");
    if (icon) gsap.fromTo(icon, { rotation: -30, transformOrigin: "50% 100%" }, { rotation: 0, duration: 0.5, ease: "elastic.out(1,0.3)" });
    gsap.fromTo(letters(), { y: 6 }, { y: 0, duration: 0.4, stagger: 0.03, ease: "back.out(3)" });
    if (hits.current >= SHATTER_AFTER) {
      hits.current = 0;
      busy.current = true;
      gsap.timeline({ onComplete: () => { busy.current = false; } })
        .to(letters(), { x: () => gsap.utils.random(-46, 46), y: () => gsap.utils.random(-40, 40), rotation: () => gsap.utils.random(-120, 120), opacity: 0.2, duration: 0.45, ease: "power3.out" })
        .to(letters(), { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.9, stagger: 0.04, ease: "elastic.out(1,0.45)" }, "+=0.25");
    }
  }

  return (
    <button
      ref={root}
      onMouseEnter={wobble}
      onFocus={wobble}
      onClick={hit}
      className="group relative inline-flex shrink-0 items-center gap-3 rounded-full border border-[#d9cfa8] bg-[#e4dab4] px-6 py-3 text-ink shadow-[0_6px_0_-2px_#cdbf8a] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0.5"
      aria-label={hint ? `${label}: ${hint}` : label}
    >
      <DoodleIcon name={icon} size={38} />
      <span className="text-xl font-extrabold tracking-tight" aria-hidden>
        {label.split("").map((ch, i) => (
          <span key={i} data-letter className="inline-block whitespace-pre">{ch}</span>
        ))}
      </span>
    </button>
  );
}
