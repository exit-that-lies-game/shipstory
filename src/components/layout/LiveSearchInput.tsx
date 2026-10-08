"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

export function LiveSearchInput({ initial }: { initial: string }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const last = useRef(initial);
  useEffect(() => {
    const q = v.trim().slice(0, 60);
    if (q === last.current) return;
    const t = setTimeout(() => {
      last.current = q;
      router.replace(q ? `/search?q=${encodeURIComponent(q)}` : "/search", { scroll: false });
    }, 250);
    return () => clearTimeout(t);
  }, [v, router]);
  return (
    <form action="/search" role="search" className="relative">
      <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
      <input name="q" value={v} onChange={(e) => setV(e.target.value)} autoFocus={!initial} autoComplete="off" enterKeyHint="search" placeholder="Search projects, tags, builders..." aria-label="Search projects and builders" className="w-full rounded-xl border border-line bg-paper py-3 pl-11 pr-4 text-base outline-none placeholder:text-[#9a9b86] focus:border-olive focus:ring-2 focus:ring-[#a3b18a55]" />
    </form>
  );
}
