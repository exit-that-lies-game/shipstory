"use client";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

type TurnstileApi = { render: (element: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void };
declare global { interface Window { turnstile?: TurnstileApi } }

export function TurnstileCheck({ action, onToken }: { action: "login" | "write"; onToken: (token: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const callback = useRef(onToken);
  useEffect(() => { callback.current = onToken; }, [onToken]);
  const mount = useCallback(() => {
    if (!box.current || !window.turnstile || widget.current) return;
    widget.current = window.turnstile.render(box.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY, action, theme: "light", size: "flexible",
      callback: (token: string) => { setError(""); callback.current(token); },
      "expired-callback": () => { callback.current(""); setError("Verification expired. Please check again."); },
      "error-callback": () => { callback.current(""); setError("Verification could not load. Check your connection and reload."); },
    });
  }, [action]);
  useEffect(() => { if (ready || window.turnstile) mount(); return () => { if (widget.current && window.turnstile) { window.turnstile.remove(widget.current); widget.current = null; } }; }, [ready, mount]);
  return <div className="space-y-2">
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={() => setReady(true)} onError={() => setError("Verification could not load. Reload to try again.")} />
    <div ref={box} className="min-h-[65px] w-full" aria-label="Security verification" />
    {error && <p role="alert" className="text-sm text-terracotta">{error}</p>}
  </div>;
}

export function WriteVerification() {
  const [verified, setVerified] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!verified) return;
    const timer = setTimeout(() => setVerified(false), 55 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [verified]);
  const [error, setError] = useState("");
  const verify = useCallback(async (token: string) => {
    if (!token) { setVerified(false); return; }
    try {
      const res = await fetch("/api/abuse/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const result = await res.json();
      if (!res.ok) { setError(result.error ?? "Verification failed. Please reload and try again."); return; }
      setError(""); setVerified(true);
    } catch { setError("Could not connect. Reload to try again."); }
  }, []);
  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return null;
  return <div className="my-4 text-sm text-muted">
    {verified ? <p role="status">Verified. This check renews before it expires.</p> : <><p className="mb-2">Quick check before posting or publishing.</p><TurnstileCheck key={attempt} action="write" onToken={verify} /></>}
    {error && <div className="mt-2 text-terracotta"><p role="alert">{error}</p><button type="button" className="mt-2 underline" onClick={() => { setError(""); setVerified(false); setAttempt(v => v + 1); }}>Try again</button></div>}
  </div>;
}
