"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { isFollowing, setFollow } from "@/lib/actions/follow";
import { supabaseConfigured } from "@/lib/supabase/client";

export function FollowButton({ compact = false, userId }: { compact?: boolean; userId?: string }) {
  const router = useRouter();
  const [on, setOn] = useState(false);
  useEffect(() => { if (supabaseConfigured && userId) isFollowing(userId).then(setOn); }, [userId]);

  async function toggle() {
    const next = !on;
    setOn(next);
    if (!supabaseConfigured || !userId) return;
    const r = await setFollow(userId, next);
    if (r === "auth") { setOn(false); router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`); }
    else if (r !== next) setOn(r);
  }

  const size = compact ? "px-2.5 py-1 text-[10px]" : "px-5 py-2.5 text-xs";
  const tone = on ? "border border-ink bg-sage text-ink" : compact ? "border border-line bg-paper text-ink hover:bg-sage hover:border-ink" : "border border-ink bg-ink text-paper hover:border-terracotta hover:bg-terracotta";
  return (
    <button onClick={toggle} aria-pressed={on} className={`inline-flex items-center gap-1.5 font-mono font-semibold uppercase tracking-[0.08em] transition-colors ${size} ${tone}`}>
      {on ? <><Icon name="check" size={14} />Following</> : <>{!compact && <Icon name="plus" size={14} />}Follow</>}
    </button>
  );
}
