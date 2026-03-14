import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BrandProvider } from "@/components/BrandProvider";
import { Suspense } from "react";
import { Shop } from "@/types/shop";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import ScrollToTop from "@/components/common/ScrollToTop";

const inter = Inter({ subsets: ["latin"] });

import { SEOManager } from "@/components/common/seo/SEOManager";
import { SEOInjection } from "@/components/common/seo/SEOInjection";
import B2BAuditPage from "@/components/audit/B2BAuditPage";

import { getCurrentSEO } from "@/lib/metadata-config";
import { AUDIT_MODE } from "@/lib/brand-config";

/**
 * generateMetadata — 도메인/브랜드별 타이틀 동적 분기
 * - AUDIT_MODE=true (P4 초코파트너스) → 타이틀 "초코파트너스 - 파트너스크레딧 공식 B2B 플랫폼"
 * - 기본 (P2 코코알바)               → getCurrentSEO() 기반 타이틀
 */
export async function generateMetadata(): Promise<Metadata> {
  const isAuditMode = AUDIT_MODE;

  if (isAuditMode) {
    return {
      title: "코코알바 - B2B 점주 전용 매칭 솔루션",
      description: "코코알바 파트너스가 제안하는 검증된 원스톱 인재 채용 플랫폼입니다. 맞춤 분석 및 정산 솔루션을 제공합니다.",
      other: {
        google: "notranslate",
        "color-scheme": "light",
        "supported-color-schemes": "light",
      },
      robots: {
        index: true,
        follow: true,
      }
    };
  }

  const seoConfig = getCurrentSEO();
  return {
    title: seoConfig.metadata.title,
    description: seoConfig.metadata.description,
    keywords: seoConfig.metadata.keywords,
    verification: seoConfig.metadata.verification,
    other: {
      google: "notranslate",
      "color-scheme": seoConfig.theme.colorScheme,
      "supported-color-schemes": seoConfig.theme.supportedColorSchemes,
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
  console.log('[RootLayout] AUDIT_MODE:', AUDIT_MODE);
  // [Optimization] Server-side data prep for sidebars
  const grandAds = (shopsData as Shop[]).filter(s => s.tier === 'grand');
  const premiumAds = (shopsData as Shop[]).filter(s => s.tier === 'premium' || s.is_premium);
  const sideAds = [...grandAds, ...premiumAds];

  return (
    <html lang="ko" className="notranslate" translate="no">
      <body className={`${inter.className} notranslate`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NXSFG837"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PTJ9T25K"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* Meta Pixel Code (noscript) */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID_HERE&ev=PageView&noscript=1"
          />
        </noscript>

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

        {/* TODO: 나이스 화이트셀 연동 시 필요한 스크립트가 있다면 여기에 추가 */}

        {/* Meta Pixel Code */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', 'YOUR_PIXEL_ID_HERE');
              fbq('track', 'PageView');
            `,
          }}
        />

        {/* Google Tag Manager - PTJ9T25K */}
        <Script
          id="gtm-script-2"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PTJ9T25K');`
          }}
        />
        
        {AUDIT_MODE ? (
          // [Perfect Cloaking] 완전한 B2B 솔루션 화면만 렌더링 (코코알바 테마/사이드바 등 일절 없음)
          <B2BAuditPage />
        ) : (
          <>
            <SEOManager />
            <SEOInjection />
            <BrandProvider>
              <ScrollToTop />
              <div className="flex flex-col h-auto">
                <LayoutWrapper sideAds={sideAds}>
                  <Suspense fallback={null}>
                    {children}
                  </Suspense>
                </LayoutWrapper>
              </div>
            </BrandProvider>
          </>
        )}
      </body>
    </html>
  );
}
