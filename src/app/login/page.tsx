import { Logo } from "@/components/ui/Logo";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next = "/feed", error } = await searchParams;
  return (
    <main className="bg-glow grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-paper p-8 shadow-lift">
        <Logo />
        <h1 className="mt-8 text-2xl font-extrabold tracking-tight">Welcome to ShipStory</h1>
        <p className="mt-1 text-sm text-muted">Sign in to publish projects, react and follow builders.</p>
        <div className="mt-6"><OAuthButtons next={next} /></div>
        
      {error && <p className="mt-4 text-center text-xs text-terracotta">Sign-in did not complete. Try again.</p>}
      </div>
    </main>
  );
}
