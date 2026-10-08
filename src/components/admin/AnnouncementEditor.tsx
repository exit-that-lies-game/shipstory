"use client";
/* eslint-disable @next/next/no-img-element */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAnnouncement } from "@/server/admin/actions";
// Uploads one banner image straight to R2 through a signed URL from the admin-only route.
async function uploadBanner(file: File): Promise<string> {
  const res = await fetch("/api/admin/banner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ file: { type: file.type, size: file.size } }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.uploadUrl) throw new Error(data.error ?? "Could not start the upload.");
  const put = await fetch(data.uploadUrl, { method: "PUT", headers: data.headers, body: file });
  if (!put.ok) throw new Error("Image upload failed. Try again.");
  return data.publicUrl as string;
}
export function AnnouncementEditor() {
  const [title, setTitle] = useState(""), [body, setBody] = useState(""), [link, setLink] = useState(""), [image, setImage] = useState(""), [note, setNote] = useState(""), [busy, setBusy] = useState(false);
  const [pending, start] = useTransition(); const router = useRouter();
  async function pick(f: File | undefined) {
    if (!f) return; setBusy(true); setNote("");
    try { setImage(await uploadBanner(f)); } catch (e) { setNote(e instanceof Error ? e.message : "Upload failed."); } finally { setBusy(false); }
  }
  return <form className="mb-6 space-y-3 rounded-2xl border border-line bg-paper p-5" onSubmit={e => { e.preventDefault(); start(async () => { const r = await saveAnnouncement(title, body, image, link); setNote(r.error ?? "Draft saved. Publish it below after reviewing."); if (!r.error) { setTitle(""); setBody(""); setLink(""); setImage(""); router.refresh(); } }); }}>
    <h2 className="text-xl font-bold">New banner</h2>
    {image ? <img src={image} alt="Banner preview" className="h-40 w-full rounded-xl object-cover" /> : <div className="flex h-28 items-center justify-center rounded-xl bg-[#e9eed9] text-sm text-olive">No image yet (optional)</div>}
    <div className="flex flex-wrap items-center gap-3"><label className="cursor-pointer rounded-lg border border-line bg-paper px-3 py-2 text-xs font-semibold text-olive">{busy ? "Uploading..." : image ? "Replace image" : "Upload banner image"}<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={busy} onChange={e => pick(e.target.files?.[0])} /></label>{image && <button type="button" onClick={() => setImage("")} className="text-xs text-muted underline">Remove image</button>}<span className="text-xs text-muted">PNG, JPG or WebP, up to 5 MB</span></div>
    <input required aria-label="Banner title" value={title} onChange={e => setTitle(e.target.value)} maxLength={100} placeholder="Title" className="w-full rounded-xl border border-line p-3" />
    <textarea required aria-label="Banner message" value={body} onChange={e => setBody(e.target.value)} maxLength={500} placeholder="Message" className="w-full rounded-xl border border-line p-3" />
    <input aria-label="Banner link" value={link} onChange={e => setLink(e.target.value)} maxLength={300} placeholder="Link (optional, /new or https://...)" className="w-full rounded-xl border border-line p-3" />
    <button disabled={pending || busy} className="rounded-xl bg-terracotta px-4 py-2 font-semibold text-white disabled:opacity-50">{pending ? "Saving..." : "Save draft"}</button>
    <p role="status" className="text-sm text-muted">{note}</p>
  </form>;
}
