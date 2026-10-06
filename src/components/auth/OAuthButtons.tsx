"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/lib/supabase/client";

type Provider = "github" | "google";

export function OAuthButtons({ next = "/feed" }: { next?: string }) {
  const [busy, setBusy] = useState<Provider | null>(null);
  const [error, setError] = useState("");

  async function go(provider: Provider) {
    setBusy(provider);
    setError("");
    const { error } = await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) { setError(error.message); setBusy(null); }
  }

  const base = "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-colors disabled:opacity-60";
  return (
    <div className="space-y-3">
      <button disabled={!!busy} onClick={() => go("github")} className={`${base} bg-terracotta text-white hover:bg-[#a84b2f]`}>
        <Icon name="github" size={18} />{busy === "github" ? "Redirecting..." : "Continue with GitHub"}
      </button>
      <button disabled={!!busy} onClick={() => go("google")} className={`${base} border border-line bg-paper hover:border-sage`}>
        <Icon name="google" size={18} />{busy === "google" ? "Redirecting..." : "Continue with Google"}
      </button>
      {error && <p className="text-center text-xs text-terracotta">{error}</p>}
    </div>
  );
}
