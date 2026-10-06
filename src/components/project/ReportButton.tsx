"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { reportProject } from "@/lib/actions/report";
import { supabaseConfigured } from "@/lib/supabase/client";

const REASONS = [["spam", "Spam"], ["abuse", "Abusive"], ["broken", "Broken or fake"], ["copyright", "Copyright"], ["other", "Other"]] as const;

export function ReportButton({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  async function send(reason: string) {
    setOpen(false);
    if (supabaseConfigured && projectId) {
      const r = await reportProject(projectId, reason);
      if (r === "auth") return router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      if (r === "error") return;
    }
    setSent(true);
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} disabled={sent} aria-expanded={open} className="flex items-center gap-1.5 text-xs text-muted hover:text-terracotta disabled:opacity-60">
        <Icon name="flag" size={13} />{sent ? "Reported, thanks" : "Report"}
      </button>
      {open && (
        <ul className="absolute bottom-7 left-0 z-10 w-44 rounded-xl border border-line bg-paper p-1 shadow-lift">
          {REASONS.map(([k, label]) => <li key={k}><button onClick={() => send(k)} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#e9eed9]">{label}</button></li>)}
        </ul>
      )}
    </div>
  );
}
