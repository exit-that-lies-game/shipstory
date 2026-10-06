import { Icon } from "@/components/ui/Icon";

const steps = ["Basics", "Links and media", "Review and publish"];

export function Stepper({ step }: { step: number }) {
  return (
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-3 text-sm">
          <span className={`grid h-8 w-8 place-items-center rounded-full border text-xs font-bold ${i < step ? "border-olive bg-olive text-white" : i === step ? "border-terracotta bg-terracotta text-white" : "border-line bg-paper text-muted"}`}>
            {i < step ? <Icon name="check" size={14} /> : i + 1}
          </span>
          <span className={i === step ? "font-bold" : "text-muted"}>{s}</span>
        </li>
      ))}
    </ol>
  );
}
