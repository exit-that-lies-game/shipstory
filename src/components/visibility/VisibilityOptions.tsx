"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { inputCls } from "@/components/wizard/Field";
import type { Suggestion } from "@/lib/actions/visibility";
import type { Visibility } from "@/shared/types";

export const VISIBILITY_LABEL: Record<Visibility, string> = { public: "Public", followers: "Followers only", private: "Only people I choose" };
const HELP: Record<Visibility, string> = {
  public: "Everyone can see it, in the feed, search and your profile.",
  followers: "Only people who follow you can see it.",
  private: "Only you and the accounts you add below.",
};

export type Person = { key: string; handle: string };

// Presentational picker shared by the publish wizard and the owner's project page.
export function VisibilityOptions({ value, onChange, people, onAdd, onRemove, onSearch, disabled = false }: {
  value: Visibility; onChange: (v: Visibility) => void; people: Person[]; disabled?: boolean;
  onAdd: (handle: string) => Promise<string | null>; onRemove: (key: string) => void;
  onSearch: (q: string) => Promise<Suggestion[]>;
}) {
  const [h, setH] = useState("");
  const [err, setErr] = useState("");
  const [options, setOptions] = useState<Suggestion[]>([]);
  const [hi, setHi] = useState(0);
  const [open, setOpen] = useState(false);
  const taken = people.map((p) => p.handle);

  // Search as you type; stale answers are dropped.
  useEffect(() => {
    if (!h.startsWith("@")) return;
    let live = true;
    const t = setTimeout(async () => {
      const r = await onSearch(h);
      if (live) { setOptions(r.filter((o) => !taken.includes(o.handle))); setHi(0); }
    }, 180);
    return () => { live = false; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h, taken.join(",")]);

  async function pick(o: Suggestion) {
    setErr("");
    const r = await onAdd(o.handle);
    if (r) setErr(r); else { setH(""); setOptions([]); setOpen(false); }
  }
  function key(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((x) => Math.min(x + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((x) => Math.max(x - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (options[hi]) pick(options[hi]); }
    else if (e.key === "Escape") setOpen(false);
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
          <div className="relative">
            <input role="combobox" aria-expanded={open && options.length > 0} aria-controls="people-suggestions" aria-autocomplete="list" aria-label="Find a person, type @ then their handle" autoComplete="off" className={inputCls} value={h} maxLength={31}
              onChange={(e) => { setH(e.target.value); setOpen(true); setErr(""); }} onKeyDown={key} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} placeholder="Type @ to find people" />
            {open && h.startsWith("@") && (
              <ul id="people-suggestions" role="listbox" className="absolute left-0 right-0 z-10 mt-1 max-h-60 overflow-auto rounded-xl border border-line bg-white p-1 shadow-lift">
                {options.length === 0 && <li className="px-3 py-2 text-sm text-muted">{h.length > 1 ? "No builders found" : "Keep typing a handle"}</li>}
                {options.map((o, i) => (
                  <li key={o.handle} role="option" aria-selected={i === hi} onMouseDown={(e) => { e.preventDefault(); pick(o); }} onMouseEnter={() => setHi(i)}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm ${i === hi ? "bg-[#e9eed9]" : ""}`}><b>@{o.handle}</b><span className="truncate text-muted">{o.name !== o.handle ? o.name : ""}</span></li>
                ))}
              </ul>
            )}
          </div>
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
