import React from 'react';
import RegionClient from '../../region/RegionClient';
import shopsData from '@/lib/data/shops.json';
import seoRegionsMaster from '@/lib/data/seo_regions_master.json';
import shadowRegionsData from '@/lib/data/Shadow_SEO_Regions.json';
import { Shop } from '@/types/shop';
import { slugify } from '@/utils/shopUtils';

export async function generateStaticParams() {
    return seoRegionsMaster.map((region) => ({
        region: slugify(region.id),
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }) {
    const { region } = await params;
    const decodedRegionSlug = decodeURIComponent(region);

    // [SEO 무결성] P3(지역페이지)는 심사 모드 여부와 관계없이 항상 원본 하이엔드 키워드(Shadow SEO)를 표출하여 랭킹 방어
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

    const shops = shopsData as Shop[];

    // [JSON-LD 매핑]
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": shadowRegionData ? `${shadowRegionData.mainRegion} 여성알바 1위` : "여성알바",
        "description": shadowRegionData ? `${shadowRegionData.mainRegion} 지역 ${shadowRegionData.keywords[0]} 추천 정보.` : "",
        "keywords": shadowRegionData ? shadowRegionData.keywords.join(', ') : "",
        "publisher": {
            "@type": "Organization",
            "name": "COCOALBA"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <RegionClient shops={shops} initialRegion={initialRegion} />
        </>
    );
}
