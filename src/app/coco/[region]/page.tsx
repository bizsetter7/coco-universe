import React from 'react';
import RegionClient from '../../region/RegionClient';
import shopsData from '@/lib/data/shops.json';
import seoRegionsMaster from '@/lib/data/seo_regions_master.json';
import { Shop } from '@/types/shop';

export async function generateStaticParams() {
    // 17,000개를 다 빌드하면 너무 느리므로, 주요 지역 위주로 샘플링하거나 전체를 빌드합니다.
    // 여기서는 sitemap과 일치시키기 위해 데이터 전체를 사용합니다.
    return seoRegionsMaster.map((region) => ({
        region: region.id,
    }));
}

export default async function CocoRegionPage({ params }: { params: Promise<{ region: string }> }) {
    const { region: _region } = await params;
    const shops = shopsData as Shop[];

    // 해당 지역의 데이터만 필터링하거나, RegionClient 내부에서 초기값으로 사용하게 할 수 있습니다.
    // 현재 RegionClient는 props로 region을 받지 않으므로, 추후 확장을 고려하여 일단 shops만 넘깁니다.
    return <RegionClient shops={shops} />;
}
