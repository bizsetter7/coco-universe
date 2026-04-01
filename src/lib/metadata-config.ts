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

const FAQ_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "코코알바가 무엇인가요?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "코코알바는 대한민국 여성 전용 고소득 아르바이트 구인구직 플랫폼입니다. 룸알바, 노래방알바, BJ알바, 엔터알바 등 다양한 업종의 채용 정보를 제공하며, 커뮤니티 기능을 통해 업계 종사 여성들이 정보를 공유하고 소통할 수 있는 공간입니다."
            }
        },
        {
            "@type": "Question",
            "name": "가입비나 이용 수수료가 있나요?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "개인 회원(구직자)의 경우 가입비 및 이용 수수료가 전혀 없습니다. 완전 무료로 전국의 구인 정보를 확인하고 커뮤니티를 이용할 수 있습니다. 업체(구인자)의 경우 광고 등록 시 요금제에 따라 비용이 발생하며, 현재 오픈 기념 이벤트로 선착순 무료 베이직 광고 혜택을 제공 중입니다."
            }
        },
        {
            "@type": "Question",
            "name": "전국 어디서나 이용 가능한가요?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "네, 코코알바는 업계 최초 로컬 기반 시스템을 도입하여 서울·경기·인천 등 수도권뿐 아니라 부산, 대구, 대전, 광주 등 전국 단위의 지역별 알바 정보를 제공합니다. 원하는 지역을 선택하면 해당 지역의 검증된 업체 공고만 확인할 수 있습니다."
            }
        },
        {
            "@type": "Question",
            "name": "하루에 얼마나 벌 수 있나요?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "업종 및 근무 형태에 따라 다르며, 코코알바에 등록된 업체들은 실제 급여 정보를 투명하게 공개합니다. 사업자 등록이 완료된 검증된 업체만 광고를 게재할 수 있어 허위·과장 광고를 방지하고 있습니다. 정확한 급여는 개별 공고 및 업체 문의를 통해 확인하시기 바랍니다."
            }
        },
        {
            "@type": "Question",
            "name": "개인정보 보호는 어떻게 되나요?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "코코알바는 이용자 익명성을 최우선으로 보호합니다. 커뮤니티 활동 시 익명으로 참여 가능하며, 개인정보는 암호화되어 안전하게 관리됩니다. 면접 전 과도한 개인정보(주민등록번호 등)나 선입금을 요구하는 업체는 즉시 신고하시기 바랍니다."
            }
        },
        {
            "@type": "Question",
            "name": "사업자 인증은 왜 필요한가요?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "코코알바는 허위 광고와 불법 업체로부터 구직자를 보호하기 위해 광고를 게재하는 모든 업체에 사업자 인증을 요구합니다. 사업자 등록증이 확인된 합법 업체만 공고를 등록할 수 있어, 이용자들이 보다 안전하게 구인 정보를 확인할 수 있습니다."
            }
        },
        {
            "@type": "Question",
            "name": "광고 등록은 어떻게 하나요?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "업체 회원 가입 후 마이샵에서 사업자 인증을 완료하면 광고 등록이 가능합니다. 베이직, 프리미엄, 그랜드 등 다양한 요금제를 제공하며, 오픈 기념 이벤트 기간에는 선착순으로 무료 베이직 광고 혜택을 드리고 있습니다."
            }
        }
    ]
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
  schemas: [BASE_ORGANIZATION_SCHEMA, CLEAN_LOCAL_BUSINESS_SCHEMA, FAQ_SCHEMA]
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
    ...shadowSEO.schemas,
    FAQ_SCHEMA
  ]
});

export const getCurrentSEO = (): SEOConfig => {
  if (CURRENT_SEO_MODE === 'SHADOW') {
      return getShadowSEO();
  }
  return CLEAN_SEO;
};
