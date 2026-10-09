"use client";
import Image from "next/image";
import { useState } from "react";

export function ScreenshotGallery({ images, title, host }: { images: string[]; title: string; host: string }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden border border-line bg-sage/30 ">
        <Image src={images[i]} alt={`${title} screenshot ${i + 1}`} fill priority sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" />
        <span className="absolute bottom-4 left-4 bg-paper px-3 py-1.5 font-mono text-xs font-medium shadow-sm">{host}</span>
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-3">
          {images.map((src, n) => (
            <button key={src + n} onClick={() => setI(n)} aria-label={`Show screenshot ${n + 1}`} aria-current={n === i} className={`relative h-[72px] w-28 overflow-hidden  border-2 transition ${n === i ? "border-terracotta" : "border-transparent opacity-80 hover:opacity-100"}`}>
              <Image src={src} alt="" fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
