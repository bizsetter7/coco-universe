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
                Portalized Center-Wing Architecture v2.1
                - mt-4 보정을 통해 사이드바 시작점을 가변적인 페이지 헤더(홈 버튼 등) 높이와 시각적 일치
            */}
            <div className="flex justify-center items-start min-h-screen bg-gray-50 dark:bg-gray-950">
              <div className="flex gap-6 w-full max-w-[1400px] justify-center px-4 relative">

                {/* 
                  왼쪽 사이드바 
                  - mt-1.5 (약 6px): 헤더 내 아이콘 수직 중앙과 시각적 동기화
                */}
                <div className="hidden xl:block mt-[26px]">
                  <BannerSidebar side="left" />
                </div>

                {/* 중앙 메인 콘텐츠 */}
                <main className="w-full max-w-[1020px] shrink-0">
                  {children}
                </main>

                {/* 
                  오른쪽 사이드바 
                  - mt-1.5: 헤더 내 아이콘 수직 중앙과 시각적 동기화
                */}
                <div className="hidden xl:block mt-[26px]">
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
