import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BrandProvider } from "@/components/BrandProvider";
import { Suspense } from "react";
import { LayoutWrapper } from "@/components/LayoutWrapper";

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
      <body className={inter.className}>
        <Suspense fallback={<div>Loading...</div>}>
          <BrandProvider>
            <div className="flex flex-col min-h-[100dvh]">
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </div>
          </BrandProvider>
        </Suspense>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('touchstart', function() {}, {passive: true});
              document.addEventListener('touchmove', function() {}, {passive: true});
            `,
          }}
        />
      </body>
    </html>
  );
}
