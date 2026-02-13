import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 정적 사이트 추출 모드 활성화
  images: {
    unoptimized: true, // 정적 추출 시 이미지 최적화 비활성화 필수
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
