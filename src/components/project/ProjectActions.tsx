"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { myState, toggle } from "@/lib/actions/reactions";
import { Icon } from "@/components/ui/Icon";

export function ProjectActions({ likes, saves, title, projectId }: { likes: number; saves: number; title: string; projectId?: string }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [initial, setInitial] = useState({ liked: false, saved: false });
  useEffect(() => { if (projectId) myState(projectId).then((s) => { setInitial(s); setLiked(s.liked); setSaved(s.saved); }); }, [projectId]);

  async function flip(table: "reactions" | "saves", cur: boolean, set: (v: boolean) => void) {
    set(!cur);
    if (!projectId) return;
    const res = await toggle(table, projectId, !cur);
    if (res === "auth") { set(cur); router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`); }
    else if (res !== !cur) set(cur);
  }
  const btn = "flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-paper px-3 py-2.5 text-sm font-semibold transition-colors hover:border-sage";

  async function share() {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title, url }); return; } catch { /* cancelled */ } }
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex gap-2.5">
      <button onClick={() => flip("reactions", liked, setLiked)} aria-pressed={liked} className={`${btn} ${liked ? "text-terracotta" : ""}`}>
        <Icon name="heart" size={17} filled={liked} />{likes + (liked ? 1 : 0) - (initial.liked ? 1 : 0)}
      </button>
      <button onClick={() => flip("saves", saved, setSaved)} aria-pressed={saved} className={`${btn} ${saved ? "text-olive" : ""}`}>
        <Icon name="bookmark" size={17} filled={saved} />{saved ? "Saved" : "Save"}
      </button>
      <button onClick={share} className={btn}><Icon name="share" size={17} />{copied ? "Link copied" : "Share"}</button>
    </div>
  );
}
