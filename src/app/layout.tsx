import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BrandProvider } from "@/components/BrandProvider";
import { Suspense } from "react";
import { Shop } from "@/types/shop";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import ScrollToTop from "@/components/common/ScrollToTop";
import { MonitorProvider } from "@/components/MonitorProvider";
import { Nanum_Gothic, Nanum_Myeongjo, Hahmlet, Gowun_Batang } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const nanumGothic = Nanum_Gothic({ weight: ["400", "700", "800"], subsets: ["latin"], display: 'swap' });
const nanumMyeongjo = Nanum_Myeongjo({ weight: ["400", "700", "800"], subsets: ["latin"], display: 'swap' });
const hahmlet = Hahmlet({ subsets: ["latin"], display: 'swap' });
const gowunBatang = Gowun_Batang({ weight: ["400", "700"], subsets: ["latin"], display: 'swap' });

import { SEOManager } from "@/components/common/seo/SEOManager";
import { SEOInjection } from "@/components/common/seo/SEOInjection";
import B2BAuditPage from "@/components/audit/B2BAuditPage";
import { AuthProvider } from '@/components/auth/AuthProvider';

import { getCurrentSEO } from "@/lib/metadata-config";
import { AUDIT_MODE, ADULT_GATE_DISABLED } from "@/lib/brand-config";

/**
 * generateMetadata — 도메인/브랜드별 타이틀 동적 분기
 * - AUDIT_MODE=true (P4 초코파트너스) → 타이틀 "초코파트너스 - 파트너스크레딧 공식 B2B 플랫폼"
 * - 기본 (P2 코코알바)               → getCurrentSEO() 기반 타이틀
 */
export async function generateMetadata(): Promise<Metadata> {
  const isAuditMode = AUDIT_MODE;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cocoalba.kr';
  const isCloneSite = siteUrl.includes('d386') || (siteUrl.includes('vercel.app') && !siteUrl.includes('cocoalba'));

  // d386 복제사이트: 구글 색인 원천 차단 + 본 사이트로 canonical 지정
  if (isCloneSite) {
    return {
      title: '코코알바',
      robots: {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
      },
      alternates: {
        canonical: 'https://www.cocoalba.kr',
      },
    };
  }

  const seoConfig = getCurrentSEO();
  const ogImage = 'https://www.cocoalba.kr/og-image.jpg';
  return {
    title: seoConfig.metadata.title,
    description: seoConfig.metadata.description,
    keywords: seoConfig.metadata.keywords,
    verification: seoConfig.metadata.verification,
    openGraph: {
      title: seoConfig.metadata.title,
      description: seoConfig.metadata.description,
      url: siteUrl,
      siteName: '코코알바',
      images: [{ url: ogImage, width: 1200, height: 630, alt: '코코알바 - No.1 여성알바 매칭' }],
      type: 'website',
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoConfig.metadata.title,
      description: seoConfig.metadata.description,
      images: [ogImage],
    },
    other: {
      google: "notranslate",
      "color-scheme": seoConfig.theme.colorScheme,
      "supported-color-schemes": seoConfig.theme.supportedColorSchemes,
      "geo.region": "KR",
      "geo.placename": "Seoul",
      "geo.position": "37.4979;127.0276",
      "ICBM": "37.4979, 127.0276",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
  colorScheme: "light",
};

import shopsData from "@/lib/data/shops.json";

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // [Optimization] Server-side data prep for sidebars
  const grandAds = (shopsData as Shop[]).filter(s => s.tier === 'grand');
  const premiumAds = (shopsData as Shop[]).filter(s => s.tier === 'premium' || s.is_premium);
  const sideAds = [...grandAds, ...premiumAds];

  return (
    <html lang="ko" className="notranslate" translate="no" suppressHydrationWarning>
      <body className={`${inter.className} ${nanumGothic.className} ${nanumMyeongjo.className} ${hahmlet.className} ${gowunBatang.className} notranslate`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NXSFG837"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {/* FB Pixel noscript: NEXT_PUBLIC_FB_PIXEL_ID 환경변수 설정 후 활성화 */}

        {!AUDIT_MODE && (
          <>
            {/* Google Tag Manager */}
            <Script
              id="gtm-script"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','GTM-NXSFG837');
                `,
              }}
            />
            {/* End Google Tag Manager */}

            {/* FB Pixel: NEXT_PUBLIC_FB_PIXEL_ID 환경변수 설정 후 아래 주석 해제 */}
            {/* <Script id="fb-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `...fbq('init', process.env.NEXT_PUBLIC_FB_PIXEL_ID)...` }} /> */}

            {/* PortOne V2 SDK */}
            <Script src="https://cdn.portone.io/v2/browser-sdk.js" strategy="afterInteractive" />
          </>
        )}
        
        {/* WebSite + SearchAction Schema — 구글 사이트링크 검색박스 활성화 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "코코알바",
              "alternateName": "COCOALBA",
              "url": "https://www.cocoalba.kr",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://www.cocoalba.kr/jobs?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

        <Suspense fallback={null}>
          <SEOManager />
          <SEOInjection />
        </Suspense>

        <AuthProvider>
          <BrandProvider>
            {/* 전역 감시 훅 — JS에러/DeadClick/WebVitals/LongTask 수집 */}
            <MonitorProvider />
            <div className="flex flex-col h-auto">
              <Suspense fallback={<div className="min-h-screen bg-white" />}>
                <LayoutWrapper sideAds={sideAds}>
                  <Suspense fallback={null}>
                    {children}
                  </Suspense>
                </LayoutWrapper>
              </Suspense>
            </div>
            <ScrollToTop />
          </BrandProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
