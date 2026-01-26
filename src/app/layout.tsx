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
                Flex-Based Master Layout (복구 버전)
                - 중앙 1020px 고정 및 양옆 사이드바 독립 구동 보장
                - item-start로 JS 추적 엔진의 자유도 확보
            */}
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex justify-center items-start">
              <div className="flex gap-6 w-full max-w-[1400px] justify-center px-0 lg:px-4 relative min-h-screen">

                {/* 
                  왼쪽 사이드바 영역
                  - h-full relative: 사이드바가 이 높이 안에서 자유롭게 움직일 수 있도록 함
                */}
                <aside className="hidden xl:block w-[160px] relative h-full">
                  <BannerSidebar side="left" />
                </aside>

                {/* 중앙 메인 콘텐츠 (물리적 중앙축 고정) */}
                <main className="w-full max-w-[1020px] flex-1 min-w-0 bg-white dark:bg-gray-900 shadow-sm xl:shadow-none min-h-screen">
                  {children}
                </main>

                {/* 오른쪽 사이드바 영역 */}
                <aside className="hidden xl:block w-[160px] relative h-full">
                  <BannerSidebar side="right" />
                </aside>

              </div>
            </div>
          </BrandProvider>
        </Suspense>
      </body>
    </html>
  );
}
