"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";

const KEY = /([0-9a-f-]{36}\/[0-9a-f-]{36})$/;

// Shrinks the picture to a 512px square (WebP) in the browser, so uploads stay small.
async function square(file: File): Promise<File> {
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height), size = Math.min(512, side);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  c.getContext("2d")!.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, size, size);
  const blob: Blob | null = await new Promise((r) => c.toBlob(r, "image/webp", 0.88));
  if (!blob) throw new Error("Could not read that image.");
  return new File([blob], "avatar.webp", { type: "image/webp" });
}

export function AvatarUpload({ name, current }: { name: string; current?: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(current);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const enabled = process.env.NEXT_PUBLIC_MEDIA_BACKEND === "r2";

  async function pick(file?: File) {
    if (!file) return;
    setNote("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) return setNote("Use a PNG, JPG or WebP picture.");
    setBusy(true);
    try {
      const img = await square(file);
      const sign = await fetch("/api/media/sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ files: [{ type: img.type, size: img.size }] }) });
      const s = await sign.json().catch(() => ({}));
      if (!sign.ok || !s.uploads?.[0]) throw new Error(s.error ?? "Could not start the upload.");
      const up = s.uploads[0];
      const put = await fetch(up.uploadUrl, { method: "PUT", headers: up.headers, body: img });
      if (!put.ok) throw new Error("Upload failed. Try again.");
      const sb = createClient();
      const { data: auth } = await sb.auth.getUser();
      const { error } = await sb.from("profiles").update({ avatar_url: up.publicUrl }).eq("id", auth.user?.id ?? "");
      if (error) throw new Error("Could not save your photo.");
      const old = url?.match(KEY)?.[1];
      if (old) fetch("/api/media/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paths: [old] }) }).catch(() => undefined);
      setUrl(up.publicUrl);
      router.refresh();
    } catch (e) { setNote(e instanceof Error ? e.message : "Upload failed."); }
    setBusy(false);
  }

  async function remove() {
    setBusy(true); setNote("");
    const sb = createClient();
    const { data: auth } = await sb.auth.getUser();
    const { error } = await sb.from("profiles").update({ avatar_url: null }).eq("id", auth.user?.id ?? "");
    if (error) setNote("Could not remove your photo."); else {
      const old = url?.match(KEY)?.[1];
      if (old) fetch("/api/media/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paths: [old] }) }).catch(() => undefined);
      setUrl(undefined); router.refresh();
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar name={name} src={url} size={96} />
      {enabled && (
        <>
          <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label="Choose profile photo" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
          <div className="flex gap-3 text-xs font-semibold">
            <button type="button" disabled={busy} onClick={() => input.current?.click()} className="text-terracotta hover:underline disabled:opacity-50">{busy ? "Saving..." : url ? "Change photo" : "Add photo"}</button>
            {url && !busy && <button type="button" onClick={remove} className="text-muted hover:underline">Remove</button>}
          </div>
          {note && <p role="alert" className="max-w-[160px] text-center text-xs text-[#9a3f25]">{note}</p>}
        </>
      )}
    </div>
  );
}
