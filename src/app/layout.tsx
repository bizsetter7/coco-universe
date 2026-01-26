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
            {/* 16px 마스터 레이아웃: 사이드바 추적을 위한 items-stretch 강제 */}
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex justify-center items-stretch">
              <div className="flex gap-6 w-full max-w-[1400px] justify-center px-0 lg:px-4 relative min-h-full">

                {/* 왼쪽 사이드바 컨테이너: flex-1과 동일하게 stretch되어 추적 범위 확보 */}
                <aside className="hidden xl:block w-[160px] relative self-stretch">
                  <BannerSidebar side="left" />
                </aside>

                {/* 중앙 메인: 콘텐츠 길이에 따라 부모 높이를 늘림 */}
                <main className="w-full max-w-[1020px] flex-1 min-w-0 bg-white dark:bg-gray-900 shadow-sm xl:shadow-none">
                  {children}
                </main>

                {/* 오른쪽 사이드바 컨테이너 */}
                <aside className="hidden xl:block w-[160px] relative self-stretch">
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
