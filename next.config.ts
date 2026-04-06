import type { NextConfig } from "next";

// Forced reload to clear 500 error after cache purge
const nextConfig: NextConfig = {
  // output: 'export', // API Route 사용을 위해 정적 추출 모드 비활성화
  images: {
    // unoptimized: true 제거 — WebP 변환·크기 최적화 활성화 (LCP 개선)
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },        // Supabase Storage
      { protocol: 'https', hostname: 'ronqwailyistjuyolmyh.supabase.co' }, // 프로젝트 직접 지정
      { protocol: 'https', hostname: 'picsum.photos' },          // 개발용 placeholder
      { protocol: 'https', hostname: 'api.mapbox.com' },         // Mapbox 지도 이미지
      { protocol: 'https', hostname: '**.amazonaws.com' },       // S3 (확장 대비)
      { protocol: 'https', hostname: 'images.unsplash.com' },    // 기타 외부 이미지
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/region/:path*",
        destination: "https://region.cocoalba.kr/:path*",
        permanent: true,
      },
      {
        source: "/coco/:path*",
        destination: "https://region.cocoalba.kr/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
