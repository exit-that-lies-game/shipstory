import type { SVGProps } from "react";

const paths: Record<string, string> = {
  heart: "M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 4.8 6.3 4.5c2-.2 3.6.8 4.7 2.3l1 1.3 1-1.3c1.1-1.5 2.7-2.5 4.7-2.3 3.6.3 5.4 3.9 3.9 7.3C19.5 16.4 12 21 12 21z",
  bookmark: "M6 3h12v18l-6-4.5L6 21V3z",
  share: "M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M12 3v12M7.5 7.5L12 3l4.5 4.5",
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  compass: "M12 21a9 9 0 100-18 9 9 0 000 18zM15.5 8.5l-2 5-5 2 2-5 5-2z",
  users: "M16 20v-1.5a3.5 3.5 0 00-3.5-3.5h-5A3.5 3.5 0 004 18.5V20M10 11a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4zM20 20v-1.5a3.5 3.5 0 00-2.5-3.3M15.5 4.8a3.2 3.2 0 010 6",
  folder: "M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",
  bell: "M6 16V11a6 6 0 1112 0v5l1.5 2h-15L6 16zM10 21h4",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4",
  play: "M8 5v14l11-7L8 5z",
  external: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
  plus: "M12 5v14M5 12h14",
  comment: "M4 5h16v11H9l-5 4V5z",
  check: "M5 12.5l4.5 4.5L19 7.5",
  x: "M6 6l12 12M18 6L6 18",
  arrow: "M5 12h14M13 6l6 6-6 6",
  back: "M19 12H5M11 6l-6 6 6 6",
  upload: "M12 16V4M7 9l5-5 5 5M4 20h16",
  flag: "M5 21V4M5 4h11l-2 4 2 4H5",
  code: "M9 8l-5 4 5 4M15 8l5 4-5 4",
  link: "M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  gift: "M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7S10 3 8 4s0 3 4 3zM12 7s2-4 4-3-0 3-4 3z",
  tag: "M3 12V4h8l10 10-8 8L3 12zM7.5 8.5h.01",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
  trend: "M3 17l6-6 4 4 8-8M15 7h6v6",
};

export type IconName = keyof typeof paths | "github" | "google";

export function Icon({ name, size = 18, filled = false, ...rest }: { name: IconName; size?: number; filled?: boolean } & SVGProps<SVGSVGElement>) {
  if (name === "github") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...rest}>
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 015.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
      </svg>
    );
  }
  if (name === "google") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...rest}>
        <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.87h5.38a4.6 4.6 0 01-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.34z" />
        <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.23-2.5c-.9.6-2.04.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0012 22z" />
        <path fill="#FBBC05" d="M6.41 13.9a6 6 0 010-3.8V7.51H3.07a10 10 0 000 8.98l3.34-2.59z" />
        <path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A10 10 0 003.07 7.51L6.41 10.1C7.2 7.74 9.4 5.98 12 5.98z" />
      </svg>
    );
  }
  const fillable = name === "heart" || name === "bookmark" || name === "play";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled || name === "play" ? "currentColor" : "none"} stroke="currentColor" strokeWidth={fillable && name !== "play" ? 1.8 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>
      <path d={paths[name as string]} />
    </svg>
  );
}
