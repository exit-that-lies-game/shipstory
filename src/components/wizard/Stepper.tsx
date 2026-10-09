import { Icon } from "@/components/ui/Icon";

const steps = ["Basics", "Links and media", "Review and publish"];

export function Stepper({ step }: { step: number }) {
  return (
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-3 text-sm">
          <span className={`grid h-8 w-8 place-items-center  border font-mono text-xs font-bold ${i < step ? "border-ink bg-ink text-paper" : i === step ? "border-ink bg-sage text-ink" : "border-line bg-paper text-muted"}`}>
            {i < step ? <Icon name="check" size={14} /> : i + 1}
          </span>
          <span className={i === step ? "font-bold" : "text-muted"}>{s}</span>
        </li>
      ))}
    </ol>
  );
}
