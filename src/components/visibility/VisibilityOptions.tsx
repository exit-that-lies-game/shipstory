"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { inputCls } from "@/components/wizard/Field";
import type { Visibility } from "@/shared/types";

export const VISIBILITY_LABEL: Record<Visibility, string> = { public: "Public", followers: "Followers only", private: "Only people I choose" };
const HELP: Record<Visibility, string> = {
  public: "Everyone can see it, in the feed, search and your profile.",
  followers: "Only people who follow you can see it.",
  private: "Only you and the accounts you add below.",
};

export type Person = { key: string; handle: string };

// Presentational picker shared by the publish wizard and the owner's project page.
export function VisibilityOptions({ value, onChange, people, onAdd, onRemove, disabled = false }: {
  value: Visibility; onChange: (v: Visibility) => void; people: Person[]; disabled?: boolean;
  onAdd: (handle: string) => Promise<string | null>; onRemove: (key: string) => void;
}) {
  const [h, setH] = useState("");
  const [err, setErr] = useState("");
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const handle = h.trim().replace(/^@/, "").toLowerCase();
    if (!handle) return;
    setErr("");
    const r = await onAdd(handle);
    if (r) setErr(r); else setH("");
  }
  return (
    <fieldset disabled={disabled} className="space-y-2">
      <legend className="mb-2 text-sm font-semibold">Who can see this project</legend>
      {(["public", "followers", "private"] as Visibility[]).map((v) => (
        <label key={v} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm transition-colors ${value === v ? "border-olive bg-[#e9eed9]" : "border-line bg-paper hover:border-sage"}`}>
          <input type="radio" name="visibility" className="mt-1 accent-[#556b2f]" checked={value === v} onChange={() => onChange(v)} />
          <span><b className="flex items-center gap-1.5">{v !== "public" && <Icon name="lock" size={14} />}{VISIBILITY_LABEL[v]}</b><span className="text-muted">{HELP[v]}</span></span>
        </label>
      ))}
      {value === "private" && (
        <div className="rounded-xl border border-line bg-paper p-4">
          <form onSubmit={add} className="flex gap-2">
            <input aria-label="Add a person by handle" className={inputCls} value={h} maxLength={40} onChange={(e) => setH(e.target.value)} placeholder="@handle" />
            <button type="submit" className="shrink-0 rounded-xl bg-olive px-4 text-sm font-semibold text-white hover:bg-[#465a27]">Add</button>
          </form>
          {err && <p role="alert" className="mt-2 text-xs text-[#9a3f25]">{err}</p>}
          <ul className="mt-3 flex flex-wrap gap-2">
            {people.length === 0 && <li className="text-xs text-muted">Nobody added yet. Only you can see it.</li>}
            {people.map((p) => (
              <li key={p.key} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-[#faf7ed] py-1 pl-3 pr-1.5 text-[13px] font-medium">@{p.handle}
                <button type="button" aria-label={`Remove @${p.handle}`} onClick={() => onRemove(p.key)} className="grid h-5 w-5 place-items-center rounded-full text-muted hover:bg-[#f1e3da] hover:text-[#9a3f25]">&times;</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </fieldset>
  );
}
