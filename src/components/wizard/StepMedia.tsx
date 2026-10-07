import { Icon } from "@/components/ui/Icon";
import { Field, inputCls } from "./Field";
import type { Draft } from "./types";

export function StepMedia({ d, set }: { d: Draft; set: (p: Partial<Draft>) => void }) {
  const onCover = (f?: File) => f && set({ coverPreview: URL.createObjectURL(f), coverFile: f });
  const onShots = (files: FileList | null) => files && set({ shotPreviews: [...d.shotPreviews, ...Array.from(files).map((f) => URL.createObjectURL(f))].slice(0, 6), shotFiles: [...d.shotFiles, ...Array.from(files)].slice(0, 6) });
  return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-bold">Links and media</h2><p className="text-sm text-muted">Where people can try it, and what it looks like.</p></div>
      <Field label="Live demo URL"><input className={`${inputCls} font-mono text-sm`} value={d.demoUrl} onChange={(e) => set({ demoUrl: e.target.value })} placeholder="https://yourproject.com" inputMode="url" /></Field>
      <Field label="Repo URL" hint="optional"><input className={`${inputCls} font-mono text-sm`} value={d.repoUrl} onChange={(e) => set({ repoUrl: e.target.value })} placeholder="https://github.com/you/project" inputMode="url" /></Field>
      <p className="text-sm text-muted">Your media allowance is 20 images, up to 100 MiB. Uploads are public once stored.</p>
      <div>
        <span className="mb-1.5 block text-sm font-semibold">Cover image</span>
        <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-paper text-sm text-muted transition-colors hover:border-sage focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-olive">
          <Icon name="upload" size={20} />{d.coverPreview ? "Cover added. Click to replace." : "Click to upload (JPG, PNG or WebP, max 5 MiB)"}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => onCover(e.target.files?.[0])} />
        </label>
      </div>
      <div>
        <span className="mb-1.5 block text-sm font-semibold">Screenshots <span className="font-normal text-muted">(up to 6)</span></span>
        <div className="flex flex-wrap gap-3">
          {d.shotPreviews.map((s) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={s} src={s} alt="Screenshot preview" className="h-16 w-24 rounded-lg border border-line object-cover" />
          ))}
          <label className="grid h-16 w-24 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-line text-muted hover:border-sage focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-olive"><Icon name="plus" /><input type="file" multiple accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => onShots(e.target.files)} /></label>
        </div>
      </div>
    </div>
  );
}
