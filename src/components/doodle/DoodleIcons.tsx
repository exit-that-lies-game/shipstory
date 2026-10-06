"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export type DoodleName = "eyes" | "heart" | "hammer" | "spark" | "arrow";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Hand-drawn style icons. Eyes get pupils that follow the cursor. */
export function DoodleIcon({ name, size = 40 }: { name: DoodleName; size?: number }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (name === "eyes") {
      const pupils = svg.querySelectorAll<SVGElement>("[data-pupil]");
      const moveX = gsap.quickTo(pupils, "x", { duration: 0.25, ease: "power3.out" });
      const moveY = gsap.quickTo(pupils, "y", { duration: 0.25, ease: "power3.out" });
      const onMove = (e: PointerEvent) => {
        const r = svg.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 160) * 4.5;
        moveX((dx / d) * k);
        moveY((dy / d) * k);
      };
      window.addEventListener("pointermove", onMove);
      return () => window.removeEventListener("pointermove", onMove);
    }
    if (name === "heart") {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4 });
      tl.to(svg, { scale: 1.18, duration: 0.18, ease: "power2.out", transformOrigin: "50% 50%" }).to(svg, { scale: 1, duration: 0.5, ease: "elastic.out(1,0.4)" });
      return () => { tl.kill(); };
    }
    if (name === "spark") {
      const t = gsap.to(svg, { rotation: 360, duration: 14, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
      return () => { t.kill(); };
    }
  }, [name]);

  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 48 48" aria-hidden className="shrink-0">
      {name === "eyes" && (
        <g {...stroke}>
          <path d="M8 24c0-8 3-14 7-14s7 6 7 14-3 14-7 14-7-6-7-14z" />
          <path d="M26 24c0-8 3-14 7-14s7 6 7 14-3 14-7 14-7-6-7-14z" />
          <ellipse data-pupil cx="16" cy="25" rx="2.6" ry="4.4" fill="currentColor" />
          <ellipse data-pupil cx="34" cy="25" rx="2.6" ry="4.4" fill="currentColor" />
        </g>
      )}
      {name === "heart" && <path {...stroke} d="M24 41c-9-6-17-12-17-21 0-5 3.800-8 8-8 3.600 0 7 2.200 9 6 2-3.800 5.400-6 9-6 4.200 0 8 3 8 8 0 9-8 15-17 21z" />}
      {name === "hammer" && (
        <g {...stroke} data-hammer>
          <path d="M14 8h20v8H14z" fill="currentColor" fillOpacity="0.15" />
          <path d="M24 16v26" />
          <path d="M20 42h8" />
        </g>
      )}
      {name === "spark" && <path {...stroke} d="M24 6v36M8 14l32 20M8 34l32-20" />}
      {name === "arrow" && <path {...stroke} d="M44 24H8M18 12L7 24l11 12M30 20c3-3 6 3 9 0" />}
    </svg>
  );
}
