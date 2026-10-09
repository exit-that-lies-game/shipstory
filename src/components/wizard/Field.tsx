import type { ReactNode } from "react";

export const inputCls = "w-full  border border-line bg-paper px-4 py-3 text-[15px] outline-none placeholder:text-muted focus:border-ink focus:ring-1 focus:ring-ink";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex justify-between text-sm font-bold"><span>{label}</span>{hint && <span className="font-normal text-muted">{hint}</span>}</span>
      {children}
    </label>
  );
}
