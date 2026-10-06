"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function ReportButton() {
  const [sent, setSent] = useState(false);
  return (
    <button onClick={() => setSent(true)} disabled={sent} className="flex items-center gap-1.5 text-xs text-muted hover:text-terracotta disabled:opacity-60">
      <Icon name="flag" size={13} />{sent ? "Reported, thanks" : "Report"}
    </button>
  );
}
