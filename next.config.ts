import type { NextConfig } from "next";

// Forced reload to clear 500 error after cache purge
const nextConfig: NextConfig = {
  // output: 'export', // API Route 사용을 위해 정적 추출 모드 비활성화
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
