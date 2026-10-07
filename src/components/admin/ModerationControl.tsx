"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { moderate } from "@/lib/admin/actions";
export function ModerationControl({kind, target, decision, label}: {kind: string; target: string; decision: string; label: string}) {
 const [pending, start] = useTransition(); const [confirm, setConfirm] = useState(false); const [error, setError] = useState(""); const router = useRouter();
 return <div className="inline-flex flex-col items-start gap-1"><button disabled={pending} onClick={() => {if (!confirm) return setConfirm(true); start(async () => {const result = await moderate(kind,target,decision); if(result.error) setError(result.error); else {setConfirm(false); setError(""); router.refresh();}});}} className="rounded-lg border border-line bg-paper px-3 py-2 text-xs font-semibold text-olive hover:bg-[#e9eed9] disabled:opacity-50">{pending ? "Saving..." : confirm ? `Confirm ${label.toLowerCase()}?` : label}</button>{confirm && !pending && <button onClick={() => setConfirm(false)} className="text-xs text-muted underline">Cancel</button>}{error && <p role="alert" className="text-xs text-terracotta">{error}</p>}</div>;
}
