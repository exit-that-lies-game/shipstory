"use client";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import type { Comment } from "@/lib/data";

function CommentRow({ c }: { c: Comment }) {
  const [liked, setLiked] = useState(false);
  return (
    <li className="flex gap-3 rounded-2xl border border-line bg-paper p-4">
      <Avatar name={c.author.name} size={34} />
      <div className="min-w-0 flex-1">
        <p className="text-sm"><b>{c.author.handle}</b> <span className="ml-1 text-xs text-muted">{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></p>
        <p className="mt-1 text-[15px] leading-relaxed text-[#3b3d2a]">{c.body}</p>
      </div>
      <button onClick={() => setLiked(!liked)} aria-pressed={liked} className={`flex h-fit items-center gap-1 text-xs font-semibold ${liked ? "text-terracotta" : "text-muted"}`}>
        <Icon name="heart" size={14} filled={liked} />{c.likes + (liked ? 1 : 0)}
      </button>
    </li>
  );
}

export function CommentSection({ initial, total }: { initial: Comment[]; total: number }) {
  const [list, setList] = useState(initial);
  const [text, setText] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setList([{ id: `new-${list.length}`, projectId: "", author: { handle: "you", name: "You" }, body, likes: 0, createdAt: new Date().toISOString() }, ...list]);
    setText("");
  }

  return (
    <section aria-labelledby="comments">
      <h2 id="comments" className="text-xl font-bold">Comments <span className="text-muted">&middot; {total + list.length - initial.length}</span></h2>
      <form onSubmit={submit} className="mt-4 flex gap-3">
        <Avatar name="You" size={34} />
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={600} placeholder="Add a comment..." aria-label="Add a comment" className="flex-1 rounded-xl border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-olive focus:ring-2 focus:ring-[#a3b18a55]" />
        <button className="rounded-xl bg-terracotta px-4 text-sm font-semibold text-white hover:bg-[#ad4d30] disabled:opacity-40" disabled={!text.trim()}>Post</button>
      </form>
      <ul className="mt-4 space-y-3">{list.map((c) => <CommentRow key={c.id} c={c} />)}</ul>
    </section>
  );
}
