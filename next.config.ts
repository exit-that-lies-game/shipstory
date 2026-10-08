import type { NextConfig } from "next";

// Allow images from the R2 public address (custom domain or r2.dev) once R2_PUBLIC_BASE_URL is set at build time.
function r2Pattern(): NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> {
  try {
    const u = new URL(process.env.R2_PUBLIC_BASE_URL ?? "");
    if (u.protocol !== "https:") return [];
    return [{ protocol: "https", hostname: u.hostname, pathname: `${u.pathname.replace(/\/$/, "")}/**` }];
  } catch { return []; }
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { remotePatterns: [...r2Pattern(), { protocol: "https", hostname: "qqklobbzjzudkpuvjnvl.supabase.co", pathname: "/storage/v1/object/public/project-media/**" }] },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'" },
    ] }];
  },
};
export default nextConfig;
