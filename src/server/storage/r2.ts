import { presignUrl } from "./sigv4.ts";

export const MEDIA_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_MEDIA_BYTES = 5 * 1024 * 1024;
const KEY_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

type Cfg = { account: string; bucket: string; keyId: string; secret: string; publicBase: string };

export function r2Config(): Cfg | null {
  const { R2_ACCOUNT_ID: account, R2_BUCKET: bucket, R2_ACCESS_KEY_ID: keyId, R2_SECRET_ACCESS_KEY: secret, R2_PUBLIC_BASE_URL: base } = process.env;
  if (!account || !bucket || !keyId || !secret || !base) return null;
  if (!/^[a-f0-9]{32}$/i.test(account) || !/^[a-z0-9-]{3,63}$/.test(bucket)) return null;
  try { const u = new URL(base); if (u.protocol !== "https:") return null; return { account, bucket, keyId, secret, publicBase: u.origin + u.pathname.replace(/\/$/, "") }; } catch { return null; }
}

// Keys are always userId/uuid, handed out by the reserve_media_slots database function.
export const isMediaKey = (k: unknown): k is string => typeof k === "string" && KEY_RE.test(k);
export const keyBelongsTo = (key: string, uid: string) => key.startsWith(uid + "/");
export const publicUrl = (c: Cfg, key: string) => `${c.publicBase}/${key}`;
export const validFile = (f: { type?: unknown; size?: unknown }) =>
  typeof f.type === "string" && MEDIA_TYPES.includes(f.type) && typeof f.size === "number" && Number.isInteger(f.size) && f.size > 0 && f.size <= MAX_MEDIA_BYTES;

const amzNow = () => new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const host = (c: Cfg) => `${c.account}.r2.cloudflarestorage.com`;

// The signature covers content-type and content-length, so the upload must be exactly this type and size.
export function signUpload(c: Cfg, key: string, type: string, size: number) {
  const url = presignUrl({ method: "PUT", host: host(c), path: `/${c.bucket}/${key}`, region: "auto", service: "s3", accessKeyId: c.keyId, secretAccessKey: c.secret, amzDate: amzNow(), expires: 300, signedHeaders: { "content-type": type, "content-length": String(size) } });
  return { uploadUrl: url, headers: { "Content-Type": type }, publicUrl: publicUrl(c, key) };
}

export async function deleteObject(c: Cfg, key: string): Promise<boolean> {
  const url = presignUrl({ method: "DELETE", host: host(c), path: `/${c.bucket}/${key}`, region: "auto", service: "s3", accessKeyId: c.keyId, secretAccessKey: c.secret, amzDate: amzNow(), expires: 60 });
  const r = await fetch(url, { method: "DELETE", signal: AbortSignal.timeout(10000) });
  return r.ok || r.status === 404;
}
