import Image from "next/image";

const tones = ["from-terracotta to-sage", "from-olive to-sage", "from-[#d98a6e] to-terracotta", "from-sage to-[#e9eed9]"];

// Shows the profile photo when there is one, otherwise the first letter. The photo URL is vetted in the data layer.
export function Avatar({ name, size = 28, src }: { name: string; size?: number; src?: string }) {
  const tone = tones[(name.charCodeAt(0) || 0) % tones.length];
  if (src) return <Image src={src} alt="" width={size} height={size} unoptimized className="inline-block shrink-0 rounded-full object-cover ring-2 ring-paper" style={{ width: size, height: size }} aria-hidden />;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${tone} font-bold text-white ring-2 ring-paper`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
