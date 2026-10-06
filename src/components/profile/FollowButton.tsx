"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function FollowButton({ compact = false }: { compact?: boolean }) {
  const [on, setOn] = useState(false);
  const size = compact ? "px-3 py-1 text-xs" : "px-5 py-2.5 text-sm";
  const tone = on ? "border border-olive bg-[#e9eed9] text-olive" : compact ? "border border-line bg-paper text-ink hover:border-sage" : "bg-terracotta text-white hover:bg-[#ad4d30]";
  return (
    <button onClick={() => setOn(!on)} aria-pressed={on} className={`inline-flex items-center gap-1.5 rounded-xl font-semibold transition-colors ${size} ${tone}`}>
      {on ? <><Icon name="check" size={14} />Following</> : <>{!compact && <Icon name="plus" size={14} />}Follow</>}
    </button>
  );
}
