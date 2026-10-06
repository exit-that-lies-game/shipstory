"use client";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { useRouter } from "next/navigation";
import { postComment, toggleCommentLike } from "@/lib/actions/comments";
import { supabaseConfigured } from "@/lib/supabase/client";
import type { Comment } from "@/lib/data";

function CommentRow({ c }: { c: Comment }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  async function like() {
    const next = !liked;
    setLiked(next);
    if (!supabaseConfigured || c.id.startsWith("new-")) return;
    const r = await toggleCommentLike(c.id, next);
    if (r === "auth") { setLiked(false); router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`); }
  }
  return (
    <li className="flex gap-3 rounded-2xl border border-line bg-paper p-4">
      <Avatar name={c.author.name} size={34} />
      <div className="min-w-0 flex-1">
        <p className="text-sm"><b>{c.author.handle}</b> <span className="ml-1 text-xs text-muted">{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></p>
        <p className="mt-1 text-[15px] leading-relaxed text-[#3b3d2a]">{c.body}</p>
      </div>
      <button onClick={like} aria-pressed={liked} className={`flex h-fit items-center gap-1 text-xs font-semibold ${liked ? "text-terracotta" : "text-muted"}`}>
        <Icon name="heart" size={14} filled={liked} />{c.likes + (liked ? 1 : 0)}
      </button>
    </li>
  );
}

export function CommentSection({ initial, total, projectId }: { initial: Comment[]; total: number; projectId?: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [list, setList] = useState(initial);
  const [text, setText] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setNote("");
    let id = `new-${list.length}`, handle = "you", name = "You";
    if (supabaseConfigured && projectId) {
      const res = await postComment(projectId, body);
      if (!res.ok) {
        if (res.reason === "auth") return router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return setNote(res.reason === "limit" ? "Slow down a little, try again soon." : "Could not post. Try again.");
      }
      ({ id, handle, name } = res);
    }
    setList([{ id, projectId: projectId ?? "", author: { handle, name }, body, likes: 0, createdAt: new Date().toISOString() }, ...list]);
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
      {note && <p className="mt-2 text-xs text-terracotta">{note}</p>}
      <ul className="mt-4 space-y-3">{list.map((c) => <CommentRow key={c.id} c={c} />)}</ul>
    </section>
  );
}
