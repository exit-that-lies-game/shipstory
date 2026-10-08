"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { grantAccess, revokeAccess } from "@/server/admin/actions";
export function GrantForm() {
  const [email, setEmail] = useState(""), [again, setAgain] = useState(""), [role, setRole] = useState("admin"), [note, setNote] = useState(""), [step, setStep] = useState(false);
  const [pending, start] = useTransition(); const router = useRouter();
  return <form className="space-y-3" onSubmit={e => { e.preventDefault(); if (!step) { setStep(true); return; } start(async () => { const r = await grantAccess(email, role, again); setNote(r.error ?? r.status ?? ""); if (!r.error) { setEmail(""); setAgain(""); setStep(false); router.refresh(); } }); }}>
    <div className="flex flex-wrap gap-2"><input required type="email" aria-label="Person's email" value={email} onChange={e => { setEmail(e.target.value); setStep(false); }} maxLength={254} placeholder="person@gmail.com" className="min-w-0 flex-1 rounded-xl border border-line p-3" />
      <select aria-label="Role" value={role} onChange={e => setRole(e.target.value)} className="rounded-xl border border-line bg-paper p-3 text-sm"><option value="admin">Admin</option><option value="moderator">Moderator</option></select></div>
    {step && <input required type="email" aria-label="Type the email again to confirm" value={again} onChange={e => setAgain(e.target.value)} maxLength={254} placeholder="Type the email again to confirm" className="w-full rounded-xl border border-line p-3" />}
    <button disabled={pending} className="rounded-xl bg-terracotta px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Saving..." : step ? "Confirm and give access" : "Add"}</button>
    <p role="status" className="text-sm text-muted">{note}</p>
  </form>;
}
export function RevokeButton({ member, invite, label }: { member?: string; invite?: string; label: string }) {
  const [confirm, setConfirm] = useState(false), [err, setErr] = useState(""); const [pending, start] = useTransition(); const router = useRouter();
  return <span className="inline-flex flex-col items-end gap-1"><button disabled={pending} onClick={() => { if (!confirm) return setConfirm(true); start(async () => { const r = await revokeAccess({ member, invite }); if (r.error) setErr(r.error); else router.refresh(); }); }} className="rounded-lg border border-line bg-paper px-3 py-2 text-xs font-semibold text-terracotta disabled:opacity-50">{pending ? "Removing..." : confirm ? `Confirm: ${label.toLowerCase()}?` : label}</button>{confirm && !pending && <button onClick={() => setConfirm(false)} className="text-xs text-muted underline">Cancel</button>}{err && <span role="alert" className="text-xs text-terracotta">{err}</span>}</span>;
}
