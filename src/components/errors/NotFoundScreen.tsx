import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { DoodleIcon } from "@/components/doodle/DoodleIcons";

export function NotFoundScreen() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <header className="mx-auto w-full max-w-[1300px] px-6 py-7 lg:px-8"><Logo /></header>
      <main id="main" className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 pb-20 text-center">
        <div aria-hidden="true" className="relative mb-7 flex items-center gap-3 text-[clamp(100px,22vw,190px)] font-extrabold leading-none tracking-[-0.08em] text-olive">
          <span>4</span><span className="relative mx-1 grid h-[100px] w-[85px] place-items-center rounded-[48%] border-[3px] border-ink bg-sage/30 sm:h-[145px] sm:w-[120px]"><DoodleIcon name="eyes" size={65} /></span><span>4</span>
          <span className="absolute -right-8 -top-3 rotate-12 text-terracotta"><DoodleIcon name="spark" size={36} /></span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">This story isn&apos;t here.</h1>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-muted">The page may have moved, or the project is no longer available.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><Button href="/feed" size="lg">Explore projects</Button><Button href="/" variant="ghost" size="lg">Back home</Button></div>
      </main>
      <footer className="px-6 pb-7 text-center text-sm text-muted">Keep building. There&apos;s more to discover.</footer>
    </div>
  );
}
