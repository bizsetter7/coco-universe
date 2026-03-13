/**
 * SEO & Metadata Switching Logic Core
 * 'CLEAN': 건전 구인 플랫폼 모드 (구글 봇 및 앱 심사용 화이트셀)
 * 'NIGHT': 유흥/밤알바 플랫폼 모드 (실 서비스용)
 * 
 * 빌드 시 환경변수(NEXT_PUBLIC_SEO_MODE)에 따라 스위칭되며,
 * CLEAN 모드일 경우 NIGHT 객체의 텍스트는 런타임 결과물에 하드코딩되지 않는 구조를 유도합니다.
 */

// 타입 정의
export type SEOMode = 'CLEAN' | 'NIGHT';

// 환경 변수에서 모드를 가져옵니다. 기본값은 'CLEAN' (보안 최우선)
export const CURRENT_SEO_MODE: SEOMode = (process.env.NEXT_PUBLIC_SEO_MODE as SEOMode) || 'CLEAN';

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

// ---------------------------------------------------------------------------------------------------------------------
// 1. CLEAN 모드 데이터 (White Cell)
// - 지역 기반 신뢰 구인 플랫폼 Entity 구성
// - 조직(Organization), 웹사이트(WebSite) 등을 활용해 유해 키워드 없이 로컬 SEO와 신뢰도(E-E-A-T) 점수 확보
// ---------------------------------------------------------------------------------------------------------------------

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
    "name": "코코알바(COCOALBA) 지역 일자리 매칭",
    "description": "지역 내 검증된 기업과 최적의 인재를 안전하게 연결하는 맞춤 채용 플랫폼입니다. 믿을 수 있는 지역 일자리 정보를 제공합니다.",
    "url": "https://cocoalba.kr",
    "image": "https://cocoalba.kr/logo.png"
};

const CLEAN_SEO: SEOConfig = {
  theme: {
    colorScheme: 'light',
    supportedColorSchemes: 'light',
  },
  metadata: {
    title: "코코알바(COCOALBA) - 지역 기반 맞춤 채용 매칭 플랫폼",
    description: "코코알바는 지역 내 검증된 기업과 최적의 인재를 가장 빠르고 안전하게 연결하는 로컬 친화적 매칭 플랫폼입니다.",
    keywords: ["구인구직", "지역일자리", "단기알바", "맞춤채용", "업종별일자리", "알바플랫폼", "파트너스"],
    verification: {
        google: 'enzbVhzoI9Bq9YzGqFaLghzkqVlFHwe-DBnnNajWC0Y',
        other: {
            'naver-site-verification': ['950201bcd2e28188884dfc9feeb6951a40c0887c'],
        },
    },
  },
  schemas: [BASE_ORGANIZATION_SCHEMA, CLEAN_LOCAL_BUSINESS_SCHEMA]
};

// ---------------------------------------------------------------------------------------------------------------------
// 2. NIGHT 모드 데이터 (Real Service)
// - 유흥, 고소득, 밤알바 관련 실 서비스 키워드 적용
// - JobPosting 스키마를 통해 구체적인 급여 조건 등 공격적인 타겟팅 데이터 포함
// ---------------------------------------------------------------------------------------------------------------------

const NIGHT_JOB_POSTING_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "전국 고소득 알바 채용 정보",
  "description": "대한민국 No.1 여성 고소득 알바 플랫폼 코코알바. 여우알바, 퀸알바 보다 빠른 매칭.",
  "identifier": {
      "@type": "PropertyValue",
      "name": "COCOALBA",
      "value": "MAIN_ADS"
  },
  "datePosted": "2026-01-01T00:00:00Z", // Fixed date for stability
  "validThrough": "2027-01-01T00:00:00Z", // Fixed date for stability
  "hiringOrganization": {
      "@type": "Organization",
      "name": "COCOALBA",
      "sameAs": "https://cocoalba.kr"
  },
  "jobLocation": {
      "@type": "Place",
      "address": {
          "@type": "PostalAddress",
          "addressLocality": "Seoul",
          "addressRegion": "KR",
          "streetAddress": "Gangnam-gu",
          "postalCode": "06000"
      }
  }
};

// IMPORTANT: CLEAN 모드 빌드 시 트리쉐이킹을 돕기 위해 Night 설정은 지연 평가(getter 등)나 별도 블록으로 분리하는 것도 좋지만,
// 일단 Next.js 환경에서는 이렇게 작성하더라도 환경변수 기반으로 사용하는 부분만 번들링될 확률이 높습니다.
const getNightSEO = (): SEOConfig => ({
  theme: {
    colorScheme: 'light',
    supportedColorSchemes: 'light',
  },
  metadata: {
    title: "코코알바(COCOALBA) - No.1 고소득 여성알바 공식 제휴",
    description: "대한민국 1등 여성 고소득 알바 플랫폼 코코알바. 여우알바, 퀸알바, 밤알바 구직 정보를 실시간으로 확인하고 가장 안전하고 빠른 매칭을 경험하세요. 당일지급 보장!",
    keywords: ["코코알바", "여우알바", "퀸알바", "밤알바", "고소득알바", "여성알바", "유흥알바", "룸알바", "바알바", "텐프로"],
    verification: {
      google: 'enzbVhzoI9Bq9YzGqFaLghzkqVlFHwe-DBnnNajWC0Y',
      other: {
        'naver-site-verification': ['950201bcd2e28188884dfc9feeb6951a40c0887c'],
      },
    },
  },
  schemas: [
    {
        ...BASE_ORGANIZATION_SCHEMA,
        name: "COCOALBA (코코알바)",
    }, 
    NIGHT_JOB_POSTING_SCHEMA
  ]
});

// 환경변수에 의존한 게이트웨이
// process.env.NEXT_PUBLIC_SEO_MODE 분기를 통해, CLEAN 시 NIGHT 객체 초기화 로직이 번들에서 떨어져 나갈 수 있도록 돕습니다.
export const getCurrentSEO = (): SEOConfig => {
  if (CURRENT_SEO_MODE === 'NIGHT') {
      return getNightSEO();
  }
  return CLEAN_SEO;
};
