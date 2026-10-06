import type { ReactNode } from "react";

export const inputCls = "w-full rounded-xl border border-line bg-paper px-4 py-3 text-[15px] outline-none placeholder:text-[#a5a690] focus:border-olive focus:ring-2 focus:ring-[#a3b18a55]";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex justify-between text-sm font-semibold"><span>{label}</span>{hint && <span className="font-normal text-muted">{hint}</span>}</span>
      {children}
    </label>
  );
}
