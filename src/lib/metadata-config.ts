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
      "telephone": "+82-10-0000-0000",
      "contactType": "customer service",
      "areaServed": "KR",
      "availableLanguage": "Korean"
  }
};

const CLEAN_LOCAL_BUSINESS_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "코코알바(COCOALBA) B2B 매칭",
    "description": "지역 내 검증된 기업과 최적의 인재를 안전하게 연결하는 엔터프라이즈 맞춤 채용 플랫폼입니다. 믿을 수 있는 지역 일자리 정보를 제공합니다.",
    "url": "https://cocoalba.kr",
    "image": "https://cocoalba.kr/logo.png"
};

const CLEAN_SEO: SEOConfig = {
  theme: {
    colorScheme: 'light',
    supportedColorSchemes: 'light',
  },
  metadata: {
    title: "코코알바(COCOALBA) B2B - 데이터 기반 기업 맞춤 채용 매칭 플랫폼",
    description: "코코알바 B2B는 평가정보 연동을 통해 검증된 프리미엄 인재와 기업을 안전하고 빠르게 연결하는 100% 실명 기반 스마트 파트너십 솔루션입니다.",
    keywords: ["B2B채용", "기업전용솔루션", "인재풀검증", "맞춤채용", "실명인증채용", "스마트에스크로"],
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
    title: decodeB64(shadowSEO.metadata.title),
    description: decodeB64(shadowSEO.metadata.description),
    keywords: shadowSEO.metadata.keywords.map(decodeB64),
    verification: shadowSEO.metadata.verification
  },
  schemas: [
    {
        ...BASE_ORGANIZATION_SCHEMA,
        name: "COCOALBA (코코알바)",
    }, 
    ...shadowSEO.schemas.map(s => ({
        ...s,
        title: s.title ? decodeB64(s.title) : undefined,
        description: s.description ? decodeB64(s.description) : undefined,
    }))
  ]
});

export const getCurrentSEO = (): SEOConfig => {
  if (CURRENT_SEO_MODE === 'SHADOW') {
      return getShadowSEO();
  }
  return CLEAN_SEO;
};
