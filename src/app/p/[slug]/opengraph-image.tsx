import { ImageResponse } from "next/og";
import { getProject } from "@/lib/data";

export const alt = "ShipStory project";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProject((await params).slug);
  const title = (p?.title ?? "ShipStory").slice(0, 60);
  const pitch = (p?.pitch ?? "Show what you build").slice(0, 110);
  const owner = p ? `by @${p.owner.handle}` : "";
  const host = p?.demoUrl ? p.demoUrl.replace(/^https?:\/\//, "").replace(/\/$/, "").slice(0, 50) : "";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#faf7ed", padding: 72, fontFamily: "sans-serif", color: "#2a2c1e" }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 800 }}>
          <span>Ship</span><span style={{ color: "#c15a3a" }}>Story</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>{title}</div>
          <div style={{ fontSize: 38, marginTop: 24, color: "#556b2f", lineHeight: 1.3 }}>{pitch}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 30, color: "#6b6d58" }}>
          <span>{owner}</span>
          <span style={{ background: "#a3b18a", color: "#2a2c1e", padding: "10px 22px", borderRadius: 14, fontFamily: "monospace" }}>{host || "shipstory"}</span>
        </div>
      </div>
    ),
    size,
  );
}
