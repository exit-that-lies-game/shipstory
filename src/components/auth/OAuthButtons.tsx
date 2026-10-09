"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { TurnstileCheck } from "@/components/abuse/TurnstileCheck";

type Provider = "github" | "google";

export function OAuthButtons({ next = "/feed" }: { next?: string }) {
  const [busy, setBusy] = useState<Provider | null>(null);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [attempt, setAttempt] = useState(0);

  async function go(provider: Provider) {
    setBusy(provider);
    setError("");
    try {
      const res = await fetch("/api/auth/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider, next, token }) });
      const result = await res.json();
      if (!res.ok || !result.url) { setError(result.error ?? "Sign-in could not start. Please try again."); setBusy(null); setToken(""); setAttempt(n => n + 1); return; }
      window.location.assign(result.url);
    } catch { setError("Could not connect. Check your connection and try again."); setBusy(null); }
  }

  const base = "inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.08em] transition-colors disabled:opacity-60";
  return (
    <div className="space-y-3">
      <p className="text-center text-xs text-muted">GitHub sign-in continues through read-only repository permission and repository selection. No code access or edits.</p>
      <TurnstileCheck key={attempt} action="login" onToken={setToken} />
      <button disabled={!!busy || !token} onClick={() => go("github")} className={`${base} border border-ink bg-ink text-paper hover:border-terracotta hover:bg-terracotta`}>
        <Icon name="github" size={18} />{busy === "github" ? "Redirecting..." : "Continue with GitHub"}
      </button>
      <button disabled={!!busy || !token} onClick={() => go("google")} className={`${base} border border-ink bg-paper hover:bg-sage`}>
        <Icon name="google" size={18} />{busy === "google" ? "Redirecting..." : "Continue with Google"}
      </button>
      {error && <p role="alert" className="text-center text-sm text-terracotta">{error}</p>}
    </div>
  );
}
