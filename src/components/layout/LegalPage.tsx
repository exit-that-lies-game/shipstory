import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
export const LEGAL_UPDATED = "October 8, 2026";
export const CONTACT_EMAIL = "contact.invgen@gmail.com";
export function SiteFooter() {
  return <footer className="border-t border-line py-8 text-center text-sm text-muted"><nav aria-label="Legal" className="mb-2 flex justify-center gap-5"><Link className="hover:text-ink" href="/privacy">Privacy</Link><Link className="hover:text-ink" href="/terms">Terms</Link></nav>ShipStory &middot; Show what you build</footer>;
}
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return <><header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5"><Logo /><Link href="/feed" className="text-sm font-medium text-muted hover:text-ink">Back to ShipStory</Link></header><main id="main" className="mx-auto max-w-3xl px-6 pb-16 pt-6"><h1 className="text-4xl font-extrabold tracking-tight">{title}</h1><p className="mt-2 text-sm text-muted">Last updated {LEGAL_UPDATED}</p><div className="mt-8 space-y-6 leading-relaxed text-ink [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_a]:text-terracotta [&_a]:underline">{children}</div></main><SiteFooter /></>;
}
