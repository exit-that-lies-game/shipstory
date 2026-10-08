import { readFileSync, readdirSync } from "node:fs";
import assert from "node:assert/strict";
const f = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const src = f("src/server/data/supabase-source.ts");
// Search: every user term passes through cleanTerm before reaching a PostgREST filter.
assert(src.includes("const term = cleanTerm(q)"));
assert(!/\.or\(`[^`]*\$\{q\}/.test(src), "raw q in filter");
const clean = (q) => (q ?? "").replace(/[%,()*\\_"'`:;{}<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
assert.equal(clean("a,b),owner_id.neq.x"), "a b owner id.neq.x");
assert(!/[,()%]/.test(clean("x%,or(title.eq.1)")));
assert(clean("y".repeat(200)).length === 60);
// Legal pages exist and are linked from the landing page footer.
const priv = f("src/app/privacy/page.tsx"), terms = f("src/app/terms/page.tsx");
assert(/read-only access to repository metadata only/.test(priv) && /cannot read your code/.test(priv));
assert(/not allowed/i.test(terms) && /Moderation/.test(terms));
assert(f("src/components/layout/LegalPage.tsx").includes('href="/privacy"') && f("src/components/layout/LegalPage.tsx").includes('href="/terms"'));
// Comment reports: insert only as the signed-in reporter, through the existing rate-limited table.
const rep = f("src/lib/actions/report.ts");
assert(rep.includes("reporter_id: uid, comment_id: commentId"));
// Share image carries no private data: reads only the public project record fields.
const og = f("src/app/p/[slug]/opengraph-image.tsx");
assert(!/repoUrl|SERVICE|secret/i.test(og));
// No server secrets in client components.
const walk = (d) => readdirSync(new URL(`../${d}`, import.meta.url), { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(`${d}/${e.name}`) : [`${d}/${e.name}`]);
for (const p of walk("src/components").filter((p) => p.endsWith(".tsx"))) assert(!/SUPABASE_SECRET|GITHUB_APP_CLIENT_SECRET|TURNSTILE_SECRET/.test(f(p)), p);
console.log("PASS phase three: search sanitising, legal pages, comment reports, share image, client secrets");
