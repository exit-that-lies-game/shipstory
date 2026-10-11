"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, inputCls } from "@/components/wizard/Field";
import { createClient } from "@/lib/supabase/client";
import { safeHttpUrl } from "@/shared/safe-url";

type Values = { name: string; headline: string; location: string; bio: string; website: string };
const MANAGED = ["headline", "location", "website"];

export function ProfileForm({ initial, handle }: { initial: Values; handle: string }) {
  const router = useRouter();
  const [v, setV] = useState<Values>(initial);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (p: Partial<Values>) => { setV({ ...v, ...p }); setNote(null); };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const name = v.name.trim(), headline = v.headline.trim(), location = v.location.trim(), bio = v.bio.trim();
    let website = v.website.trim();
    if (!name) return setNote({ ok: false, text: "Add your name." });
    if (website && !/^https?:\/\//i.test(website)) website = "https://" + website;
    if (website && !safeHttpUrl(website)) return setNote({ ok: false, text: "That website link does not look right." });
    setBusy(true); setNote(null);
    try {
      const sb = createClient();
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) throw new Error("Please sign in again.");
      const { data: row, error: readError } = await sb.from("profiles").select("links").eq("id", auth.user.id).single();
      if (readError) throw new Error("Could not load your profile. Check your connection and try again.");
      const kept = Array.isArray(row?.links) ? row.links.filter((l: { type?: string }) => !MANAGED.includes(l?.type ?? "")) : [];
      const links = [...kept,
        ...(headline ? [{ type: "headline", text: headline }] : []),
        ...(location ? [{ type: "location", text: location }] : []),
        ...(website ? [{ type: "website", url: safeHttpUrl(website) }] : []),
      ];
      const { error } = await sb.from("profiles").update({ display_name: name, bio: bio || null, links }).eq("id", auth.user.id);
      if (error) throw new Error("Could not save your profile. Please try again.");
      setNote({ ok: true, text: "Saved." });
      router.push(`/u/${handle}`);
      router.refresh();
    } catch (err) {
      setNote({ ok: false, text: err instanceof TypeError ? "Could not connect. Check your connection and try again." : err instanceof Error ? err.message : "Could not save." });
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="mt-8 space-y-5">
      <Field label="Name" hint={`${v.name.length}/60`}><input className={inputCls} value={v.name} maxLength={60} onChange={(e) => set({ name: e.target.value })} autoComplete="name" /></Field>
      <Field label="Headline" hint={`${v.headline.length}/80`}><input className={inputCls} value={v.headline} maxLength={80} onChange={(e) => set({ headline: e.target.value })} placeholder="Student building weather tools" /></Field>
      <Field label="Location" hint={`${v.location.length}/60`}><input className={inputCls} value={v.location} maxLength={60} onChange={(e) => set({ location: e.target.value })} placeholder="Hyderabad, India" /></Field>
      <Field label="Bio" hint={`${v.bio.length}/280`}><textarea className={`${inputCls} min-h-28 resize-y`} value={v.bio} maxLength={280} onChange={(e) => set({ bio: e.target.value })} placeholder="What you build and why." /></Field>
      <Field label="Website"><input className={`${inputCls} font-mono text-sm`} value={v.website} onChange={(e) => set({ website: e.target.value })} placeholder="https://yoursite.com" inputMode="url" autoCapitalize="none" /></Field>
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit" size="lg" disabled={busy}>{busy ? "Saving..." : "Save profile"}</Button>
        <Button href={`/u/${handle}`} variant="ghost" size="lg">Cancel</Button>
        {note && <p role={note.ok ? "status" : "alert"} className={`text-sm ${note.ok ? "text-muted" : "text-terracotta"}`}>{note.text}</p>}
      </div>
    </form>
  );
}
