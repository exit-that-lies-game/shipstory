import { Chip } from "@/components/ui/Chip";
import type { Draft } from "./types";

export function StepReview({ d }: { d: Draft }) {
  const row = (k: string, v: string) => <div className="flex justify-between gap-6 border-b border-line py-3 text-sm"><dt className="text-muted">{k}</dt><dd className="max-w-[60%] break-words text-right font-medium">{v || "-"}</dd></div>;
  return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold">Review and publish</h2><p className="text-sm text-muted">Check everything. You can edit it later.</p></div>
      <dl>{row("Name", d.title)}{row("Pitch", d.pitch)}{row("Demo", d.demoUrl)}{row("Repo", d.repoUrl)}{row("Screenshots", `${d.shotPreviews.length} added`)}</dl>
      <div className="flex flex-wrap gap-2">{d.tags.map((t) => <Chip key={t} active>{t}</Chip>)}</div>
    </div>
  );
}
