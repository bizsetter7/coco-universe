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

export const metadata: Metadata = {
  title: "코코알바(COCOALBA) - No.1 고소득 여성알바 (여우알바, 퀸알바 공식 제휴 사이트)",
  description: "대한민국 1등 여성 고소득 알바 플랫폼 코코알바. 여우알바, 퀸알바, 밤알바 구직 정보를 실시간으로 확인하고 가장 안전하고 빠른 매칭을 경험하세요. 일급 50만 이상, 당일지급 보장!",
  verification: {
    google: 'enzbVhzoI9Bq9YzGqFaLghzkqVlFHwe-DBnnNajWC0Y',
    other: {
      'naver-site-verification': ['950201bcd2e28188884dfc9feeb6951a40c0887c'],
    },
  },
  other: {
    google: "notranslate",
    "color-scheme": "light",
    "supported-color-schemes": "light",
  },
};

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

        <script src="https://cdn.portone.io/v2/browser-sdk.js" async></script>

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
      </body>
    </html>
  );
}
