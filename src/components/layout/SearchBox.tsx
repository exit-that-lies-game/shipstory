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
        className="w-full rounded-xl border border-line bg-paper py-2.5 pl-10 pr-10 text-sm outline-none placeholder:text-[#9a9b86] focus:border-olive focus:ring-2 focus:ring-[#a3b18a55]"
      />
      <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 text-[11px] text-muted sm:block">/</kbd>
    </form>
  );
}
