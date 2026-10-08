import { readFileSync, readdirSync, statSync } from "node:fs";
import assert from "node:assert/strict";
import { presignUrl } from "../src/server/storage/sigv4.ts";
import { MEDIA_TYPES, isMediaKey, keyBelongsTo, validFile, r2Config } from "../src/server/storage/r2.ts";

const walk = (d) => readdirSync(d).flatMap((n) => { const p = `${d}/${n}`; return statSync(p).isDirectory() ? walk(p) : [p]; }).filter((p) => /\.(ts|tsx)$/.test(p));
const files = walk("src");
let checked = 0;
for (const f of files) {
  const t = readFileSync(f, "utf8");
  const client = /^\s*["']use client["']/.test(t);
  // Client code never reaches into the server layer or reads server secrets.
  if (client) { for (const m of t.matchAll(/from\s*["']@\/server\/([^"']+)["']/g)) assert(/^\s*["']use server["']/.test(readFileSync(`src/server/${m[1]}.ts`, "utf8")), `${f}: client file imports non-action server code (${m[1]})`); assert(!/process\.env\.(?!NEXT_PUBLIC_)/.test(t), `${f}: client file reads a server env var`); checked++; }
  // The server layer never imports UI.
  if (f.startsWith("src/server/")) assert(!/@\/components\//.test(t), `${f}: server code imports UI`);
  // Shared code stays free of server imports.
  if (f.startsWith("src/shared/")) assert(!/@\/server\//.test(t) && !/node:/.test(t), `${f}: shared code imports server code`);
}
assert(checked > 5, "expected to check several client files");
// Old locations are gone.
for (const old of ["src/lib/data", "src/lib/abuse", "src/lib/admin", "src/lib/github-app.ts", "src/lib/github-import.ts", "src/lib/supabase/server.ts"]) { let gone = false; try { statSync(old); } catch { gone = true; } assert(gone, `${old} should have moved to src/server or src/shared`); }

// SigV4 presign matches the AWS documentation example (S3 query-string auth).
const url = presignUrl({ method: "GET", host: "examplebucket.s3.amazonaws.com", path: "/test.txt", region: "us-east-1", service: "s3", accessKeyId: "AKIAIOSFODNN7EXAMPLE", secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY", amzDate: "20130524T000000Z", expires: 86400 });
assert(url.endsWith("X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404"), "SigV4 test vector");

// Upload rules.
assert(validFile({ type: "image/png", size: 1000 }) && validFile({ type: "image/webp", size: 5 * 1024 * 1024 }));
assert(!validFile({ type: "image/svg+xml", size: 10 }) && !validFile({ type: "text/html", size: 10 }) && !validFile({ type: "image/png", size: 5 * 1024 * 1024 + 1 }) && !validFile({ type: "image/png", size: 0 }) && !validFile({ type: "image/png", size: 1.5 }) && !validFile({ type: "image/png" }));
assert.deepEqual(MEDIA_TYPES, ["image/png", "image/jpeg", "image/webp"]);
const u1 = "0307901a-dfe7-49aa-a524-bacc8c316de5", u2 = "11111111-2222-3333-4444-555555555555", k = `${u1}/ce5b0190-1744-4b7c-b80d-be30aff245f2`;
assert(isMediaKey(k) && keyBelongsTo(k, u1) && !keyBelongsTo(k, u2));
for (const bad of ["../x", `${u1}/../x`, `${u1}/a`, `${u1}/${u1}/${u1}`, "", null, 5, `${u1}/ce5b0190-1744-4b7c-b80d-be30aff245f2.png`]) assert(!isMediaKey(bad), String(bad));
// Config only accepts a complete https setup.
const saved = { ...process.env };
for (const n of ["R2_ACCOUNT_ID", "R2_BUCKET", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_PUBLIC_BASE_URL"]) delete process.env[n];
assert.equal(r2Config(), null);
Object.assign(process.env, { R2_ACCOUNT_ID: "a".repeat(32), R2_BUCKET: "shipstory-media", R2_ACCESS_KEY_ID: "x", R2_SECRET_ACCESS_KEY: "y", R2_PUBLIC_BASE_URL: "http://pub.example.com" });
assert.equal(r2Config(), null, "http base url rejected");
process.env.R2_PUBLIC_BASE_URL = "https://pub.example.com/";
assert.equal(r2Config()?.publicBase, "https://pub.example.com");
Object.assign(process.env, saved);
// Routes: same-origin, sign-in, quota function and ownership checks are present.
const sign = readFileSync("src/app/api/media/sign/route.ts", "utf8"), del = readFileSync("src/app/api/media/delete/route.ts", "utf8");
for (const t of [sign, del]) { assert(t.includes("sameOrigin(request)") && t.includes("auth.getUser()") && t.includes("keyBelongsTo")); assert(!/NEXT_PUBLIC_[A-Z_]*SECRET/.test(t)); }
assert(sign.includes('rpc("reserve_media_slots"') && sign.includes("validFile") && del.includes('from("media_slots")'));
const r2 = readFileSync("src/server/storage/r2.ts", "utf8");
assert(r2.includes('"content-length"') && r2.includes('"content-type"'), "signature covers type and size");
console.log(`PASS backend boundary, R2 signing and upload rules (${checked} client files checked)`);
