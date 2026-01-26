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
                Flex-Based Master Layout (16px 마스터 버전)
                - items-stretch: 사이드바 영역(aside)이 메인 콘텐츠와 동일한 높이를 갖게 함 (전역 추적 필수)
                - relative: 사이드바의 absolute 추적 기준점
            */}
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex justify-center items-stretch">
              <div className="flex gap-6 w-full max-w-[1400px] justify-center px-0 lg:px-4 relative">

                {/* 
                  왼쪽 사이드바 영역
                  - h-auto + relative: 부모의 items-stretch 덕분에 메인과 동일한 높이 확보
                */}
                <aside className="hidden xl:block w-[160px] relative">
                  <BannerSidebar side="left" />
                </aside>

                {/* 중앙 메인 콘텐츠 (물리적 중앙축 고정) */}
                <main className="w-full max-w-[1020px] flex-1 min-w-0 bg-white dark:bg-gray-900 shadow-sm xl:shadow-none">
                  {children}
                </main>

                {/* 오른쪽 사이드바 영역 */}
                <aside className="hidden xl:block w-[160px] relative">
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
