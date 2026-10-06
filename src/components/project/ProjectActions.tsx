"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function ProjectActions({ likes, saves, title }: { likes: number; saves: number; title: string }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
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
      <button onClick={() => setLiked(!liked)} aria-pressed={liked} className={`${btn} ${liked ? "text-terracotta" : ""}`}>
        <Icon name="heart" size={17} filled={liked} />{likes + (liked ? 1 : 0)}
      </button>
      <button onClick={() => setSaved(!saved)} aria-pressed={saved} className={`${btn} ${saved ? "text-olive" : ""}`}>
        <Icon name="bookmark" size={17} filled={saved} />{saved ? "Saved" : "Save"}
      </button>
      <button onClick={share} className={btn}><Icon name="share" size={17} />{copied ? "Link copied" : "Share"}</button>
    </div>
  );
}
