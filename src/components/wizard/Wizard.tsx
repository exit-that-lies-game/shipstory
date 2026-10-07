"use client";
import { GitHubImport } from "./GitHubImport";
import { useState } from "react";
import { WriteVerification } from "@/components/abuse/TurnstileCheck";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { publishProject } from "@/lib/actions/publish";
import { supabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PreviewCard } from "./PreviewCard";
import { StepBasics } from "./StepBasics";
import { StepMedia } from "./StepMedia";
import { StepReview } from "./StepReview";
import { Stepper } from "./Stepper";
import { emptyDraft, stepErrors, type Draft } from "./types";

export function Wizard() {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const set = (p: Partial<Draft>) => { setD((x) => ({ ...x, ...p, ...(x.privateSource && ("title" in p || "pitch" in p || "description" in p) ? {privateReviewed:false} : {}) })); setErrors([]); };

  async function publish() {
    if (d.privateSource && !d.privateReviewed) return setErrors(["Review and approve the private-source text before publishing."]);
    if (!supabaseConfigured || !d.coverFile) return setPublished(true);
    setBusy(true);
    const res = await publishProject({ title: d.title, pitch: d.pitch, description: d.description, tags: d.tags, demoUrl: d.demoUrl, repoUrl: d.privateSource ? "" : d.repoUrl, cover: d.coverFile, shots: d.shotFiles });
    setBusy(false);
    if (res.ok) return router.push(`/p/${res.slug}`);
    if (res.reason === "auth") return router.push("/login?next=/new");
    setErrors([res.reason === "limit" ? "You have published a few projects in the last hour. Try again later." : res.message ?? "Could not publish. Try again."]);
  }

  function next() {
    const e = stepErrors(step, d);
    if (e.length) return setErrors(e);
    if (step === 2) return publish();
    setStep(step + 1);
  }

  if (published) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-line bg-paper p-10 text-center shadow-lift">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e9eed9] text-olive"><Icon name="check" size={26} /></span>
        <h2 className="mt-5 text-2xl font-extrabold">Ready to ship</h2>
        <p className="mt-2 text-sm text-muted">Preview build: publishing is not connected to the database yet.</p>
        <Button href="/feed" className="mt-6">Back to feed</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)_380px]">
      <div><h1 className="mb-6 text-2xl font-extrabold tracking-tight">New project</h1><Stepper step={step} /></div>
      <div className="max-w-xl">
        {step === 0 && <><GitHubImport apply={set}/><StepBasics d={d} set={set}/></>}
        {step === 1 && <StepMedia d={d} set={set} />}
        {step === 2 && <><StepReview d={d} />{d.privateSource&&<label className="mt-5 flex gap-3 rounded-xl border border-line bg-paper p-4 text-sm"><input type="checkbox" checked={!!d.privateReviewed} onChange={e=>set({privateReviewed:e.target.checked})}/>I reviewed the imported private-repo text and approve publishing these project details. No private repository link or code will be shared.</label>}<WriteVerification /></>}
        {errors.length > 0 && <ul role="alert" className="mt-5 rounded-xl border border-[#e8b9a8] bg-[#fbeee8] p-3 text-sm text-[#9a3f25]">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
        <div className="mt-8 flex items-center gap-3">
          {step === 0 ? <Button href="/feed" variant="ghost">Cancel</Button> : <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>}
          <Button onClick={next} disabled={busy}>{busy ? "Publishing..." : step === 2 ? "Publish project" : "Continue"}{step < 2 && <Icon name="arrow" size={15} />}</Button>
          <span className="ml-auto text-xs text-muted">Draft in this tab</span>
        </div>
        <Link href="/feed" className="sr-only">Leave</Link>
      </div>
      <div className="hidden lg:block"><div className="sticky top-[92px]"><PreviewCard d={d} /></div></div>
    </div>
  );
}
