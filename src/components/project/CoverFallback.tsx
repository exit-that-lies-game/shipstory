// Generated cover shown when a project has no uploaded or captured image. Pure CSS, so it needs no storage or network.
const PALETTES = [
  { bg: "bg-olive", fg: "text-sage", accent: "bg-sage" },
  { bg: "bg-sage", fg: "text-ink", accent: "bg-ink" },
  { bg: "bg-ink", fg: "text-paper", accent: "bg-terracotta" },
  { bg: "bg-terracotta", fg: "text-ink", accent: "bg-paper" },
] as const;

function pick(title: string) {
  let h = 0;
  for (const ch of title) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTES[h % PALETTES.length];
}

export function CoverFallback({ title, className = "" }: { title: string; className?: string }) {
  const p = pick(title);
  const initial = (title.trim()[0] ?? "S").toUpperCase();
  return (
    <div role="img" aria-label={`${title} cover`} className={`relative flex h-full w-full flex-col justify-between overflow-hidden p-[6%] ${p.bg} ${p.fg} ${className}`}>
      <span aria-hidden className={`absolute -right-[4%] -top-[14%] select-none text-[min(38vw,260px)] font-extrabold leading-none tracking-[-0.06em] opacity-20`}>{initial}</span>
      <span aria-hidden className={`h-1.5 w-12 ${p.accent}`} />
      <span className="relative line-clamp-3 break-words text-[clamp(22px,4.2vw,44px)] font-extrabold leading-[1.02] tracking-[-0.045em]">{title}</span>
    </div>
  );
}
