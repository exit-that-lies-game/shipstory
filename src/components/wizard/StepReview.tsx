import { Chip } from "@/components/ui/Chip";
import { VisibilityOptions, VISIBILITY_LABEL } from "@/components/visibility/VisibilityOptions";
import { findHandle } from "@/lib/actions/visibility";
import { supabaseConfigured } from "@/lib/supabase/client";
import type { Draft } from "./types";

export function StepReview({ d, set }: { d: Draft; set: (p: Partial<Draft>) => void }) {
  const row = (k: string, v: string) => <div className="flex justify-between gap-6 border-b border-line py-3 text-sm"><dt className="text-muted">{k}</dt><dd className="max-w-[60%] break-words text-right font-medium">{v || "-"}</dd></div>;
  return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold">Review and publish</h2><p className="text-sm text-muted">Check everything. You can edit it later.</p></div>
      <dl>{row("Name", d.title)}{row("Pitch", d.pitch)}{row("Demo", d.demoUrl)}{row("Repo", d.repoUrl)}{row("Screenshots", `${d.shotPreviews.length} added`)}{row("Visible to", VISIBILITY_LABEL[d.visibility])}</dl>
      <VisibilityOptions value={d.visibility} onChange={(visibility) => set({ visibility })} people={d.accessHandles.map((h) => ({ key: h, handle: h }))}
        onAdd={async (h) => {
          if (d.accessHandles.includes(h)) return "Already added.";
          if (supabaseConfigured && !(await findHandle(h))) return `No builder with the handle @${h}.`;
          set({ accessHandles: [...d.accessHandles, h] });
          return null;
        }}
        onRemove={(k) => set({ accessHandles: d.accessHandles.filter((x) => x !== k) })} />
      <div className="flex flex-wrap gap-2">{d.tags.map((t) => <Chip key={t} active>{t}</Chip>)}</div>
    </div>
  );
}
