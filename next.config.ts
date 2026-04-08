import type { NextConfig } from "next";

// Forced reload to clear 500 error after cache purge
const nextConfig: NextConfig = {
  // [Fix] 탭 전환 시 Next.js 15 라우터 캐시 재검증으로 MyShopContent 재마운트 방지
  // staleTimes.dynamic = 0 (기본값) → 탭복귀 시 즉시 Suspense fallback 노출 → 폼 리셋
  experimental: {
    staleTimes: {
      dynamic: 30,   // 동적 라우트 30초간 캐시 유지 (탭 전환 보호)
      static: 300,   // 정적 라우트 5분
    },
  },
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
    return [];
  },
};

export default nextConfig;
