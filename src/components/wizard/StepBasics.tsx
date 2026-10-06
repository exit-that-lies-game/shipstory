import { Chip } from "@/components/ui/Chip";
import { Field, inputCls } from "./Field";
import { TAG_SUGGESTIONS, type Draft } from "./types";

export function StepBasics({ d, set }: { d: Draft; set: (p: Partial<Draft>) => void }) {
  const toggle = (t: string) => set({ tags: d.tags.includes(t) ? d.tags.filter((x) => x !== t) : [...d.tags, t].slice(0, 5) });
  return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold">Basic information</h2><p className="text-sm text-muted">Tell us about your project.</p></div>
      <Field label="Project name"><input className={inputCls} value={d.title} maxLength={60} onChange={(e) => set({ title: e.target.value })} placeholder="Sravana" /></Field>
      <Field label="One-line pitch" hint={`${d.pitch.length}/80`}><input className={inputCls} value={d.pitch} maxLength={80} onChange={(e) => set({ pitch: e.target.value })} placeholder="Free local music player. No ads." /></Field>
      <Field label="Short description"><textarea className={`${inputCls} min-h-28 resize-y`} value={d.description} maxLength={600} onChange={(e) => set({ description: e.target.value })} placeholder="What it does and who it is for." /></Field>
      <div>
        <span className="mb-2 block text-sm font-semibold">Tags <span className="font-normal text-muted">(up to 5)</span></span>
        <div className="flex flex-wrap gap-2">
          {TAG_SUGGESTIONS.map((t) => (
            <button type="button" key={t} onClick={() => toggle(t)} aria-pressed={d.tags.includes(t)}><Chip active={d.tags.includes(t)}>{t}</Chip></button>
          ))}
        </div>
      </div>
    </div>
  );
}
