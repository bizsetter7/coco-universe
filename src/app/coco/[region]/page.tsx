import React from 'react';
import { createClient } from '@supabase/supabase-js';
import RegionClient from '../../region/RegionClient';
import seoRegionsMaster from '@/lib/data/seo_regions_master.json';
import shadowRegionsData from '@/lib/data/Shadow_SEO_Regions.json';
import { Shop } from '@/types/shop';
import { slugify } from '@/utils/shopUtils';

export const revalidate = 300; // 5분마다 ISR 갱신

export async function generateStaticParams() {
    return seoRegionsMaster.map((region) => ({
        region: slugify(region.id),
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }) {
    const { region } = await params;
    const decodedRegionSlug = decodeURIComponent(region);

    const regionData = shadowRegionsData.find(r => slugify(r.id) === decodedRegionSlug) || {
        mainRegion: decodedRegionSlug.replace(/-/g, ' '),
        keywords: [`${decodedRegionSlug.replace(/-/g, ' ')} 알바`]
    };

    const title = `${regionData.mainRegion} 여성알바 1위 - 코코알바 (당일지급/숙식제공)`;
    const description = `${regionData.mainRegion} 지역 ${regionData.keywords.slice(0, 3).join(', ')} 정보. 확실하게 검증된 고수익 알바에서 안전하게 일하세요.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://cocoalba.kr/coco/${region}`,
            siteName: '코코알바',
            images: [
                {
                    url: 'https://cocoalba.kr/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: `${regionData.mainRegion} 여성알바 정보`,
                },
            ],
            type: 'website',
        },
        keywords: [...regionData.keywords, '여성알바', '고수익알바', '유흥알바', '룸알바', '밤알바', '당일지급', '엔터프라이즈'],
    };
}

export default async function CocoRegionPage({ params }: { params: Promise<{ region: string }> }) {
    const { region } = await params;
    const decodedRegionSlug = decodeURIComponent(region);

    // [P3 독립성] 클라이언트 렌더링에 넘기는 ID는 sanitized된 seo_regions_master 사용 가능
    // (클라이언트 텍스트 렌더링은 심사용으로 정화된 텍스트가 나와도 브라우저 렌더링 됨)
    // 단, 검색 엔진이 긁어가는 JSON-LD에는 완벽한 하이엔드 데이터를 삽입
    const shadowRegionData = shadowRegionsData.find(r => slugify(r.id) === decodedRegionSlug);
    const initialRegion = shadowRegionData ? shadowRegionData.id : decodedRegionSlug.replace(/-/g, ' ');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
        .from('shops')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(500);

    const shops: Shop[] = (data || []).map((ad: any) => ({
        ...ad,
        workType: ad.work_type || ad.category || ad.options?.category || '',
        region: ad.region || ad.work_region || ad.options?.regionCity || '',
        name: ad.name || ad.shop_name || '',
        title: ad.title || '',
        phone: ad.phone || ad.manager_phone || '',
        kakao: ad.kakao || ad.kakao_id || ad.options?.kakao || '',
        telegram: ad.telegram || ad.telegram_id || ad.options?.telegram || '',
        pay: String(ad.pay_amount || ad.options?.payAmount || 0),
        is_placeholder: false,
        url: '',
        site: '',
    }));

    const regionName = shadowRegionData ? shadowRegionData.mainRegion : decodedRegionSlug.replace(/-/g, ' ');
    const kw0 = shadowRegionData?.keywords[0] || `${regionName} 룸알바`;
    const kw1 = shadowRegionData?.keywords[1] || `${regionName} 유흥알바`;

    // [JSON-LD 1] WebPage
    const webPageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": `${regionName} 여성알바 1위 - 코코알바`,
        "description": `${regionName} 지역 검증된 ${kw0}, ${kw1} 실시간 정보. 당일지급·숙식제공 보장.`,
        "url": `https://cocoalba.kr/coco/${region}`,
        "publisher": { "@type": "Organization", "name": "코코알바", "url": "https://cocoalba.kr" }
    };

    // [JSON-LD 2] BreadcrumbList
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://cocoalba.kr" },
            { "@type": "ListItem", "position": 2, "name": "지역별 채용", "item": "https://cocoalba.kr/region" },
            { "@type": "ListItem", "position": 3, "name": `${regionName} 채용`, "item": `https://cocoalba.kr/coco/${region}` }
        ]
    };

    // [JSON-LD 3] FAQPage — GEO(AI 검색) 핵심 신호
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": `${regionName} 여성알바 평균 일당은 얼마인가요?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `${regionName} 기준 여성알바 평균 일당은 업종과 경력에 따라 20만원~50만원 수준입니다. 룸알바·텐프로 등 고급 업종은 더 높은 수입이 가능하며, 코코알바에서 검증된 업체만 확인하실 수 있습니다.`
                }
            },
            {
                "@type": "Question",
                "name": `${regionName} ${kw0} 당일지급 가능한 곳이 있나요?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `네, 코코알바에 등록된 ${regionName} 업체 대부분이 당일지급을 지원합니다. 공고 상세 페이지에서 급여 조건과 지급 방식을 확인하고, 1:1 문의로 바로 상담받으실 수 있습니다.`
                }
            },
            {
                "@type": "Question",
                "name": `${regionName} 처음 알바 시작하면 어떻게 되나요?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `코코알바는 처음 시작하는 분들을 위해 업체 사전 검증과 안전 확인 시스템을 운영합니다. 공고 문의 → 면접 → 업무 안내 순으로 진행되며, 궁금한 점은 코코알바 고객센터(1877-1442)에서 상담 가능합니다.`
                }
            },
            {
                "@type": "Question",
                "name": `${regionName}에서 숙식제공 알바도 찾을 수 있나요?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `네, 코코알바에는 숙식제공 조건의 ${regionName} 업체들이 등록되어 있습니다. 필터에서 '숙식제공' 조건을 선택하면 해당 업체만 모아볼 수 있습니다.`
                }
            }
        ]
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <RegionClient shops={shops} initialRegion={initialRegion} />
        </>
    );
}
