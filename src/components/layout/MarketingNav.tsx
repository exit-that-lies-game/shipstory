import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export function MarketingNav() {
  return (
    <header className="relative z-20 border-b border-ink">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="label-mono hidden gap-8 text-muted md:flex">
            <Link href="/feed" className="hover:text-ink">Explore</Link>
            <Link href="/#how" className="hover:text-ink">How it works</Link>
            <Link href="/feed?sort=latest" className="hover:text-ink">Latest ships</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="label-mono hidden hover:text-terracotta sm:block">Sign in</Link>
          <Button href="/login" size="sm">Start your log</Button>
        </div>
      </div>
    </header>
  );
}
