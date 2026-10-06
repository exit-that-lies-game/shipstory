"use client";
import { useState } from "react";
import Link from "next/link";
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
  const set = (p: Partial<Draft>) => { setD((x) => ({ ...x, ...p })); setErrors([]); };

  function next() {
    const e = stepErrors(step, d);
    if (e.length) return setErrors(e);
    if (step === 2) return setPublished(true);
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
        {step === 0 && <StepBasics d={d} set={set} />}
        {step === 1 && <StepMedia d={d} set={set} />}
        {step === 2 && <StepReview d={d} />}
        {errors.length > 0 && <ul role="alert" className="mt-5 rounded-xl border border-[#e8b9a8] bg-[#fbeee8] p-3 text-sm text-[#9a3f25]">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
        <div className="mt-8 flex items-center gap-3">
          {step === 0 ? <Button href="/feed" variant="ghost">Cancel</Button> : <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>}
          <Button onClick={next}>{step === 2 ? "Publish project" : "Continue"}{step < 2 && <Icon name="arrow" size={15} />}</Button>
          <span className="ml-auto text-xs text-muted">Draft saved</span>
        </div>
        <Link href="/feed" className="sr-only">Leave</Link>
      </div>
      <div className="hidden lg:block"><div className="sticky top-[92px]"><PreviewCard d={d} /></div></div>
    </div>
  );
}
