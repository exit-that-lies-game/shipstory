import { Icon } from "@/components/ui/Icon";

export function SearchBox({ defaultValue = "", wide = false }: { defaultValue?: string; wide?: boolean }) {
  return (
    <form action="/feed" className={`relative w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>
      <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="Search projects, tags, builders..."
        aria-label="Search projects"
        className="w-full border border-line bg-paper py-2.5 pl-10 pr-10 text-sm outline-none placeholder:text-muted focus:border-ink focus:ring-1 focus:ring-ink"
      />
      <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 border border-line px-1.5 font-mono text-[11px] text-muted sm:block">/</kbd>
    </form>
  );
}
