import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const route=readFileSync('src/app/api/github/import/route.ts','utf8');
assert(route.includes('String(r.owner.id)!==c.githubId'));assert(route.includes('repoUrl:r.private?""'));assert(route.includes('demoUrl:r.private?""'));assert(!route.includes('/contents/'));assert(!route.includes('/readme'));
const cb=readFileSync('src/app/api/github/callback/route.ts','utf8');assert(cb.includes('flow.uid!==data.user.id'));assert(cb.includes('flow.state!==searchParams.get("state")'));assert(cb.includes('code_verifier:flow.verifier'));assert(cb.includes('expected.id!==String(profile.id)'));
const app=readFileSync('src/lib/github-app.ts','utf8');assert(app.includes('aes-256-gcm'));assert(app.includes('c.uid===data.user.id'));assert(app.includes('r.owner.id)===c.githubId'));assert(app.includes('page++'));assert(app.includes('d.repositories.length<100'));
const wizard=readFileSync('src/components/wizard/Wizard.tsx','utf8');assert(wizard.includes('d.privateSource && !d.privateReviewed'));assert(wizard.includes('d.privateSource ? "" : d.repoUrl'));
const logout=readFileSync('src/components/layout/AccountMenu.tsx','utf8');assert(logout.includes('scope:"local"'));assert(logout.includes('/api/github/disconnect'));console.log('PASS 18 GitHub privacy/auth/logout source invariants');
