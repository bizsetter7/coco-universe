import React from 'react';
import { Metadata } from 'next';
import shopsData from '@/lib/data/shops.json';
import seoRegionsMaster from '@/lib/data/seo_regions_master.json';
import RegionClient from './RegionClient';

interface Shop {
    name: string;
    region: string;
    phone: string;
    kakao: string;
    telegram: string;
    pay: string;
    workType: string;
    url: string;
    site: string;
    id: string;
    is_placeholder: boolean;
    is_premium?: boolean;
    is_verified?: boolean;
    tier?: 'grand' | 'preferential' | 'premium' | 'special' | 'urgent' | 'recommended' | 'common';
}

type Params = Promise<{ region: string }>;

export async function generateStaticParams() {
    return seoRegionsMaster.slice(0, 100).map((region) => ({
        region: region.id,
    }));
}

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
    const { region: regionId } = await props.params;
    const region = seoRegionsMaster.find((r) => r.id === regionId) || { mainRegion: regionId.replace(/-/g, ' ') };
    const regionName = region.mainRegion;

    return {
        title: `${regionName} 구인구직 - 1위 여성알바 코코알바`,
        description: `${regionName} 지역 고소득 알바, 룸알바, 노래방알바 실시간 공고 보유. ${regionName} 업소 상세 정보와 연락처를 확인하세요.`,
        keywords: `${regionName}알바, ${regionName}룸알바, ${regionName}밤알바, 고소득알바`,
    };
}

export default async function RegionPage(props: { params: Params }) {
    const { region: rawRegionId } = await props.params;
    const regionId = decodeURIComponent(rawRegionId);
    const regionData = seoRegionsMaster.find((r) => r.id === regionId);
    const regionName = regionData ? regionData.mainRegion : regionId.replace(/-/g, ' ');

    // Filter shops on server side
    const shops = (shopsData as Shop[]).filter(shop => {
        const cleanRegionName = regionName.trim();
        const regionParts = cleanRegionName.split(' ');

        return shop.region.includes(cleanRegionName) ||
            (regionParts.length >= 2 && shop.region.includes(`${regionParts[0]} ${regionParts[1]}`));
    });

    // Mock brand object (or you can fetch/import it if available as static data)
    // Since useBrand() is a hook, we pass the necessary brand info or keep it in the client component
    // For now, we'll assume RegionClient can handle its own brand context or receive it as props

    return <RegionClient regionName={regionName} shops={shops} brand={{ theme: 'light' }} />;
}
