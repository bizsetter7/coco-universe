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
            <div className="flex justify-center items-start min-h-screen bg-gray-50 dark:bg-gray-950">
              <div className="flex gap-6 w-full max-w-[1400px] justify-center px-4 relative min-h-screen">

                {/* 
                  왼쪽 사이드바 영역
                  - h-full relative: 사이드바가 이 높이 안에서 자유롭게 움직일 수 있도록 함
                */}
                <div className="hidden xl:block w-[160px] relative">
                  <BannerSidebar side="left" />
                </div>

                {/* 중앙 메인 콘텐츠 (기존 1020px 규격 유지, 모바일에서 유연하게 축소) */}
                <main className="w-full max-w-[1020px] flex-1 min-w-0">
                  {children}
                </main>

                {/* 오른쪽 사이드바 영역 */}
                <div className="hidden xl:block w-[160px] relative">
                  <BannerSidebar side="right" />
                </div>

              </div>
            </div>
          </BrandProvider>
        </Suspense>
      </body>
    </html>
  );
}
