import "server-only";

export async function verifyTurnstile(token: unknown, action: string, hostname: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const allowed = (process.env.TURNSTILE_HOSTNAMES ?? "").split(",").map(s => s.trim()).filter(Boolean);
  if (!secret || !allowed.includes(hostname) || typeof token !== "string" || token.length < 10 || token.length > 2048) {
    console.warn("Turnstile precheck failed", { hasSecret: !!secret, hostnameAllowed: allowed.includes(hostname), hostname, tokenType: typeof token, tokenLength: typeof token === "string" ? token.length : null });
    return false;
  }
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }), signal: AbortSignal.timeout(8000), cache: "no-store",
    });
    if (!response.ok) { console.warn("Turnstile verification HTTP failure", response.status); return false; }
    const result = await response.json();
    const valid = result.success === true && result.action === action && result.hostname === hostname;
    if (!valid) console.warn("Turnstile verification rejected", { errors: result["error-codes"], action: result.action, hostname: result.hostname, expectedAction: action, expectedHostname: hostname });
    return valid;
  } catch { return false; }
}

export function sameOrigin(request: Request): boolean {
  return request.headers.get("origin") === new URL(request.url).origin;
}
