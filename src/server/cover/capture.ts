// Captures a screenshot of a project's live site through Microlink (https://microlink.io) for use as its cover.
// Swappable: only this file talks to the screenshot vendor.
const MAX_BYTES = 5 * 1024 * 1024;

// Refuses links that point at this machine or a private network, before any outside service is asked to open them.
export function capturableUrl(value: string): string | null {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    const h = u.hostname.toLowerCase();
    if (!h.includes(".") || h === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(h) || h.includes(":") || /\.(local|internal|localhost|lan|home)$/.test(h)) return null;
    if (u.username || u.password) return null;
    return u.href;
  } catch { return null; }
}

export type Shot = { bytes: Uint8Array; type: "image/jpeg" };

export async function captureScreenshot(pageUrl: string): Promise<Shot> {
  const key = process.env.MICROLINK_API_KEY;
  const base = key ? "https://pro.microlink.io/" : "https://api.microlink.io/";
  const q = new URLSearchParams({ url: pageUrl, screenshot: "true", meta: "false", type: "jpeg", "viewport.width": "1280", "viewport.height": "800", "viewport.deviceScaleFactor": "1", waitUntil: "networkidle2" });
  const res = await fetch(`${base}?${q}`, { headers: key ? { "x-api-key": key } : {}, signal: AbortSignal.timeout(25000), cache: "no-store" });
  const body = await res.json().catch(() => null);
  const shotUrl: unknown = body?.data?.screenshot?.url;
  if (!res.ok || body?.status !== "success" || typeof shotUrl !== "string") throw new Error("capture failed");
  const host = new URL(shotUrl).hostname;
  if (new URL(shotUrl).protocol !== "https:" || !(host === "microlink.io" || host.endsWith(".microlink.io"))) throw new Error("unexpected image host");
  const img = await fetch(shotUrl, { signal: AbortSignal.timeout(15000), cache: "no-store" });
  const type = img.headers.get("content-type") ?? "";
  const bytes = new Uint8Array(await img.arrayBuffer());
  if (!img.ok || !type.startsWith("image/jpeg") || bytes.length < 2000 || bytes.length > MAX_BYTES) throw new Error("bad image");
  return { bytes, type: "image/jpeg" };
}
