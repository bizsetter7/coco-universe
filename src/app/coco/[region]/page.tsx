import React from 'react';
import RegionClient from '../../region/RegionClient';
import shopsData from '@/lib/data/shops.json';
import seoRegionsMaster from '@/lib/data/seo_regions_master.json';
import { Shop } from '@/types/shop';
import { slugify } from '@/utils/shopUtils';

export async function generateStaticParams() {
    // 17,000개를 다 빌드하면 너무 느리므로, 주요 지역 위주로 샘플링하거나 전체를 빌드합니다.
    // Use slugified region IDs for URL stability
    return seoRegionsMaster.map((region) => ({
        region: slugify(region.id),
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }) {
    const { region } = await params;
    const decodedRegionSlug = decodeURIComponent(region);

    // Find original region data by matching slugified id
    const regionData = seoRegionsMaster.find(r => slugify(r.id) === decodedRegionSlug) || {
        mainRegion: decodedRegionSlug.replace(/-/g, ' '),
        keywords: [`${decodedRegionSlug.replace(/-/g, ' ')} 알바`]
    };

    const title = `${regionData.mainRegion} 고소득 알바 1위 - 코코알바 (당일지급/숙식제공)`;
    const description = `${regionData.mainRegion} 지역 ${regionData.keywords.slice(0, 3).join(', ')} 추천 정보. 검증된 업소에서 안전하게 일하세요. 시급, 일급, 월급별 맞춤 일자리 제공.`;

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
                    url: 'https://cocoalba.kr/og-image.png', // Fallback or Dynamic generation
                    width: 1200,
                    height: 630,
                    alt: `${regionData.mainRegion} 알바 정보`,
                },
            ],
            type: 'website',
        },
        keywords: [...regionData.keywords, '여성알바', '유흥알바', '밤알바', '고소득알바'],
    };
}

export default async function CocoRegionPage({ params }: { params: Promise<{ region: string }> }) {
    const { region } = await params;
    const decodedRegionSlug = decodeURIComponent(region);

    // Find original region name to pass to client
    const regionData = seoRegionsMaster.find(r => slugify(r.id) === decodedRegionSlug);
    const initialRegion = regionData ? regionData.id : decodedRegionSlug.replace(/-/g, ' ');

    const shops = shopsData as Shop[];

    return <RegionClient shops={shops} initialRegion={initialRegion} />;
}
