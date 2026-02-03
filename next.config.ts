import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint: { ignoreDuringBuilds: true }, // Vercel redeploy trigger: 2026-02-04
};

export default nextConfig;
