import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma needs to run on the server only
  serverExternalPackages: ["@prisma/client", "prisma"],

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },

  // Optimize images from OpenStreetMap and unpkg
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "unpkg.com" },
      { protocol: "https", hostname: "**.openstreetmap.org" },
    ],
  },
};

export default nextConfig;
