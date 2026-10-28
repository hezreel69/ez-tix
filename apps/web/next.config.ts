import type { NextConfig } from "next";

const apiUrl = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000"
).replace(/\/+$/, "");

/**
 * Next.js configuration for EzTix Web (`apps/web`).
 * Proxies `/api/*` requests to the Express API server (`apps/api`) so the browser
 * sees a single origin and refresh-token cookies remain first-party (`SameSite=Lax`).
 * Source: IPD Phase 1 & TRD Section 5.5
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@eztix/shared"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
