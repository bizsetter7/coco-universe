import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BrandProvider } from "@/components/BrandProvider";
import { Suspense } from "react";

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

import { BannerSidebar } from "@/components/BannerSidebar";

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
            <div className="relative min-h-screen">
              <BannerSidebar side="left" />
              <div className="max-w-screen-xl mx-auto">
                {children}
              </div>
              <BannerSidebar side="right" />
            </div>
          </BrandProvider>
        </Suspense>
      </body>
    </html>
  );
}
