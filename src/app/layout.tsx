import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BrandProvider } from "@/components/BrandProvider";
import { Suspense } from "react";
import { BannerSidebar } from "@/components/BannerSidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "코코 유니버스 - 최고의 알바 매칭",
  description: "대한민국 No.1 고소득 알바 플랫폼",
  verification: {
    google: 'enzbVhzoI9Bq9YzGqFaLghzkqVlFHwe-DBnnNajWC0Y',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} overflow-x-hidden`}>
        <Suspense fallback={<div>Loading...</div>}>
          <BrandProvider>
            {/* 
                Center-Aligned Layout for Absolute Tracking Sidebars
                - relative 컨테이너를 기준으로 사이드바가 absolute하게 움직입니다.
                - py-0으로 헤더 밀착 유지
            */}
            {/* 
                Grid-Based Master Layout
                - PC: [160px 사이드바 | 1020px 메인 | 160px 사이드바] 고정 설계
                - Mobile: 1컬럼 유연 레이아웃 전환
                - item-start로 스티키 사이드바의 독립적 가동 보장
            */}
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex justify-center">
              <div className="w-full max-w-[1400px] px-0 lg:px-4 grid grid-cols-1 xl:grid-cols-[160px_minmax(0,1020px)_160px] gap-0 xl:gap-6">

                {/* 왼쪽 사이드바 (PC 전용 Sticky) */}
                <aside className="hidden xl:block h-full pt-20">
                  <div className="sticky top-20">
                    <BannerSidebar side="left" />
                  </div>
                </aside>

                {/* 중앙 메인 콘텐츠 (물리적 중앙축 고정) */}
                <main className="w-full min-w-0 bg-white dark:bg-gray-900 shadow-sm xl:shadow-none">
                  {children}
                </main>

                {/* 오른쪽 사이드바 (PC 전용 Sticky) */}
                <aside className="hidden xl:block h-full pt-20">
                  <div className="sticky top-20">
                    <BannerSidebar side="right" />
                  </div>
                </aside>

              </div>
            </div>
          </BrandProvider>
        </Suspense>
      </body>
    </html>
  );
}
