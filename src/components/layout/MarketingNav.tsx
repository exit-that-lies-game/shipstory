import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export function MarketingNav() {
  return (
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
      <div className="flex items-center gap-10">
        <Logo />
        <nav className="hidden gap-8 text-sm font-medium text-muted md:flex">
          <Link href="/feed" className="hover:text-ink">Explore</Link>
          <Link href="/#how" className="hover:text-ink">How it works</Link>
          <Link href="/feed?sort=latest" className="hover:text-ink">Builders</Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/login" className="hidden text-sm font-medium text-muted hover:text-ink sm:block">Sign in</Link>
        <Button href="/login" size="sm">Get started</Button>
      </div>
    </header>
  );
}
