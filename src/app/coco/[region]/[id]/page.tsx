import shopsData from '@/lib/data/shops.json';
import { Shop } from '@/types/shop';
import JobDetailModal, { JobDetailContent } from '@/components/jobs/JobDetailModal';
import { Metadata } from 'next';
import { slugify } from '@/utils/shopUtils';

interface Props {
    params: Promise<{ region: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const shop = (shopsData as Shop[]).find((s) => s.id === decodedId);

    if (!shop) {
        return {
            title: '업소를 찾을 수 없습니다 - 코코알바',
        };
    }

    const title = `${shop.name} - ${shop.region} ${shop.category || ''} 구인정보 | 코코알바`;
    const description = `${shop.region} ${shop.name}에서 함께할 가족을 찾습니다. ${shop.payType || ''} ${shop.pay} 이상. ${shop.title || ''}. 지금 바로 확인하세요.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://cocoalba.kr/coco/${slugify(shop.region)}/${shop.id}`,
            images: shop.options?.mediaUrl ? [
                {
                    url: shop.options.mediaUrl,
                    width: 1200,
                    height: 630,
                    alt: shop.name || '업소 이미지',
                },
            ] : [
                {
                    url: 'https://cocoalba.kr/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: '코코알바',
                },
            ],
            type: 'website',
        },
        keywords: [shop.name || '', `${shop.region || ''} 알바`, shop.category || '', '여성알바', '고소득알바'],
    };
}

export async function generateStaticParams() {
    // For SEO, we want to pre-render at least premium/hot shops
    // For now, mapping all for max coverage
    // Use slugified region for safe URL segments
    return (shopsData as Shop[]).map((shop) => ({
        region: slugify(shop.region || '전체'),
        id: shop.id.toString(),
    }));
}

export default async function ShopDetailPage({ params }: Props) {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    const shop = (shopsData as Shop[]).find((s) => s.id === decodedId);

    if (!shop) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-gray-500">정보가 존재하지 않는 업소입니다.</p>
            </div>
        );
    }

    // Use JobDetailContent directly for SEO (no portal)
    return (
        <div className="max-w-[800px] mx-auto min-h-screen bg-white shadow-lg">
            <JobDetailContent shop={shop} />
        </div>
    );
}
