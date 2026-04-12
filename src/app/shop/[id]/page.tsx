import { permanentRedirect } from 'next/navigation';
import shopsData from '@/lib/data/shops.json';
import { slugify } from '@/utils/shopUtils';

interface Props {
    params: { id: string };
}

export default function LegacyShopRedirect({ params }: Props) {
    const { id } = params;

    // 1. shopsData에서 상점 검색
    const shop = (shopsData as any[]).find(s => s.id === id);

    if (shop && shop.region) {
        // [Fix] 지역명 대괄호 제거 및 슬러그화
        const regionSlug = slugify(shop.region.replace(/\[|\]/g, '').trim());
        if (regionSlug) {
            permanentRedirect(`/coco/${regionSlug}/${id}`);
        }
    }

    // 2. 상점 정보가 없거나 비정상일 경우 404가 아닌 /jobs(업종별 채용)로 안내하여 이탈 방지
    permanentRedirect('/jobs');
}
