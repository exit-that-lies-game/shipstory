import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const page = readFileSync("src/app/page.tsx", "utf8"), nav = readFileSync("src/components/layout/AppNav.tsx", "utf8"), logo = readFileSync("src/components/ui/Logo.tsx", "utf8");
assert(page.includes('redirect("/feed")') && page.includes("getAuthUser"), "landing sends signed-in users to the feed");
assert(page.indexOf("getAuthUser()") < page.indexOf("<MarketingNav"), "check happens before the sign-up page renders");
assert(nav.includes('<Logo href="/feed" />'), "app header logo goes to the feed");
assert(logo.includes('href = "/"') && logo.includes("href={href}"), "logo keeps / as default for signed-out pages");
console.log("PASS signed-in logo and landing redirect");
