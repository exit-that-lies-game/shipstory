import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function Login() {
  return (
    <main className="bg-glow grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-paper p-8 shadow-lift">
        <Logo />
        <h1 className="mt-8 text-2xl font-extrabold tracking-tight">Welcome to ShipStory</h1>
        <p className="mt-1 text-sm text-muted">Sign in to publish projects, react and follow builders.</p>
        <div className="mt-6 space-y-3">
          <Button href="/feed" size="lg" className="w-full"><Icon name="github" size={18} />Continue with GitHub</Button>
          <Button href="/feed" variant="ghost" size="lg" className="w-full"><Icon name="google" size={18} />Continue with Google</Button>
        </div>
        <p className="mt-5 text-center text-xs text-muted">Preview build: sign-in is not connected yet.</p>
      </div>
    </main>
  );
}
