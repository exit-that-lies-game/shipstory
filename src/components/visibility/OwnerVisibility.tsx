"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { VisibilityOptions, type Person } from "./VisibilityOptions";
import { searchHandles, findHandle, grantAccess, revokeAccess, setVisibility } from "@/lib/actions/visibility";
import { supabaseConfigured } from "@/lib/supabase/client";
import type { Visibility } from "@/shared/types";

// Owner-only panel on the project page: change who can see the project and manage the access list.
export function OwnerVisibility({ projectId, initial, people: initialPeople }: { projectId: string; initial: Visibility; people: { id: string; handle: string }[] }) {
  const router = useRouter();
  const [v, setV] = useState<Visibility>(initial);
  const [people, setPeople] = useState<Person[]>(initialPeople.map((p) => ({ key: p.id, handle: p.handle })));
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function change(next: Visibility) {
    const prev = v;
    setV(next); setNote(""); setBusy(true);
    const err = supabaseConfigured ? await setVisibility(projectId, next) : null;
    setBusy(false);
    if (err) { setV(prev); setNote(err); } else { setNote("Saved."); router.refresh(); }
  }
  return (
    <section className="mt-5 rounded-2xl border border-line bg-paper p-5 shadow-soft" aria-label="Project visibility">
      <VisibilityOptions value={v} onChange={change} disabled={busy} people={people}
        onAdd={async (h) => {
          const f = supabaseConfigured ? await findHandle(h) : { id: h, handle: h };
          if (!f) return `No builder with the handle @${h}.`;
          if (people.some((p) => p.key === f.id)) return "Already added.";
          const err = supabaseConfigured ? await grantAccess(projectId, f.id) : null;
          if (err) return err;
          setPeople((x) => [...x, { key: f.id, handle: f.handle }]);
          return null;
        }}
        onSearch={supabaseConfigured ? searchHandles : async (q: string) => { const t = q.replace(/^@/, "").toLowerCase(); return ["ravi", "sri", "sandeep", "meera", "arjun"].filter((x) => x.startsWith(t)).map((x) => ({ handle: x, name: x })); }}
        onRemove={async (k) => { const err = supabaseConfigured ? await revokeAccess(projectId, k) : null; if (err) setNote(err); else setPeople((x) => x.filter((p) => p.key !== k)); }} />
      <p aria-live="polite" className="mt-2 text-xs text-muted">{note}</p>
    </section>
  );
}
