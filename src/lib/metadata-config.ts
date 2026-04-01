import shadowSEO from '@/lib/data/Shadow_SEO_Master.json';
import { isPreRelease } from '@/lib/config';

const decodeB64 = (str: string) => {
    try {
        return Buffer.from(str, 'base64').toString('utf8');
    } catch (e) {
        return str;
    }
};

export type SEOMode = 'CLEAN' | 'SHADOW';

export const CURRENT_SEO_MODE: SEOMode = isPreRelease ? 'CLEAN' : 'SHADOW';

export interface SEOConfig {
  theme: {
      colorScheme: string;
      supportedColorSchemes: string;
  };
  metadata: {
    title: string;
    description: string;
    keywords?: string[];
    verification?: {
      google?: string;
      other?: {
        'naver-site-verification'?: string[];
      };
    };
    other?: {
        [key: string]: string | number | (string | number)[];
    };
  };
  schemas: any[]; // JSON-LD Schemas
}

const BASE_ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "COCOALBA (코코알바)",
  "url": "https://cocoalba.kr",
  "logo": "https://cocoalba.kr/logo.png",
  "sameAs": [
      "https://www.facebook.com/cocoalba",
      "https://www.instagram.com/cocoalba"
  ],
  "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+82-1877-1442",
      "contactType": "customer service",
      "areaServed": "KR",
      "availableLanguage": "Korean"
  }
};

const CLEAN_LOCAL_BUSINESS_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "코코알바(COCOALBA) - 룸알바 노래방알바 유흥알바 1등 플랫폼",
    "description": "지역 내 검증된 고소득 일자리와 구직자를 안전하게 연결하는 대한민국 대표 여성 전용 채용 플랫폼입니다. 룸알바, 노래방알바, BJ알바, 엔터알바 정보를 실시간 제공합니다.",
    "url": "https://cocoalba.kr",
    "image": "https://cocoalba.kr/logo.png"
};

const CLEAN_SEO: SEOConfig = {
  theme: {
    colorScheme: 'light',
    supportedColorSchemes: 'light',
  },
  metadata: {
    title: "룸알바·노래방알바·노래빠알바·유흥알바·BJ알바·엔터알바 정보 플랫폼 코코알바",
    description: "코코알바는 평가정보 연동을 통해 검증된 프리미엄 업소와 언니들을 안전하고 빠르게 연결하는 100% 신뢰 기반 고소득 여성알바 매칭 솔루션입니다.",
    keywords: ["룸알바", "노래방알바", "노래빠알바", "유흥알바", "BJ알바", "엔터알바", "여성알바", "밤알바", "고수익알바", "당일지급알바", "아가씨알바"],
    verification: {
        google: 'enzbVhzoI9Bq9YzGqFaLghzkqVlFHwe-DBnnNajWC0Y',
        other: {
            'naver-site-verification': ['950201bcd2e28188884dfc9feeb6951a40c0887c'],
        },
    },
  },
  schemas: [BASE_ORGANIZATION_SCHEMA, CLEAN_LOCAL_BUSINESS_SCHEMA]
};

const getShadowSEO = (): SEOConfig => ({
  theme: {
    colorScheme: shadowSEO.themes.colorScheme,
    supportedColorSchemes: shadowSEO.themes.supportedColorSchemes,
  },
  metadata: {
    title: shadowSEO.metadata.title,
    description: shadowSEO.metadata.description,
    keywords: shadowSEO.metadata.keywords,
    verification: shadowSEO.metadata.verification,
  },
  schemas: [
    {
        ...BASE_ORGANIZATION_SCHEMA,
        name: "COCOALBA (코코알바)",
    }, 
    ...shadowSEO.schemas
  ]
});

export const getCurrentSEO = (): SEOConfig => {
  if (CURRENT_SEO_MODE === 'SHADOW') {
      return getShadowSEO();
  }
  return CLEAN_SEO;
};
