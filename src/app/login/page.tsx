import { Logo } from "@/components/ui/Logo";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next = "/feed", error } = await searchParams;
  return (
    <main id="main" className="bg-glow grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-md border border-ink bg-paper p-8 sm:p-10">
        <Logo />
        <p className="label-mono mt-10 text-terracotta">Open your build log</p>
        <h1 className="mt-2 text-4xl font-extrabold leading-[0.95] tracking-[-0.05em]">Keep the story <span className="story-serif text-terracotta">going.</span></h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">Sign in to publish projects, post updates and follow the builders you like.</p>
        <div className="mt-6"><OAuthButtons next={next} /></div>
        {error && <p role="alert" className="mt-4 border border-terracotta p-3 text-center text-xs text-terracotta">Sign-in did not complete. Try again.</p>}
      </div>
    </main>
  );
}
