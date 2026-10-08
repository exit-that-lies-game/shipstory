import { createHash, createHmac } from "node:crypto";

const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const hmac = (key: Buffer | string, s: string) => createHmac("sha256", key).update(s).digest();
const enc = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
const encPath = (p: string) => p.split("/").map(enc).join("/");

export type PresignInput = {
  method: string; host: string; path: string; region: string; service: string;
  accessKeyId: string; secretAccessKey: string; amzDate: string; expires: number;
  signedHeaders?: Record<string, string>; // extra headers that must match on the request (host is always signed)
};

// AWS Signature V4 query-string presigning with an unsigned payload.
export function presignUrl(i: PresignInput): string {
  const date = i.amzDate.slice(0, 8);
  const scope = `${date}/${i.region}/${i.service}/aws4_request`;
  const headers: Record<string, string> = { host: i.host };
  for (const [k, v] of Object.entries(i.signedHeaders ?? {})) headers[k.toLowerCase()] = v.trim();
  const names = Object.keys(headers).sort();
  const query: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${i.accessKeyId}/${scope}`,
    "X-Amz-Date": i.amzDate,
    "X-Amz-Expires": String(i.expires),
    "X-Amz-SignedHeaders": names.join(";"),
  };
  const canonQuery = Object.keys(query).sort().map((k) => `${enc(k)}=${enc(query[k])}`).join("&");
  const canonHeaders = names.map((n) => `${n}:${headers[n]}\n`).join("");
  const canonical = [i.method, encPath(i.path), canonQuery, canonHeaders, names.join(";"), "UNSIGNED-PAYLOAD"].join("\n");
  const toSign = ["AWS4-HMAC-SHA256", i.amzDate, scope, sha(canonical)].join("\n");
  const key = hmac(hmac(hmac(hmac("AWS4" + i.secretAccessKey, date), i.region), i.service), "aws4_request");
  const signature = createHmac("sha256", key).update(toSign).digest("hex");
  return `https://${i.host}${encPath(i.path)}?${canonQuery}&X-Amz-Signature=${signature}`;
}
