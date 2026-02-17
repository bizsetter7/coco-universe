import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import shopsData from '@/lib/data/shops.json';
import { Shop } from '@/types/shop';
import { generateSEOKeywords } from '@/utils/shopUtils';
import { JobDetailContent } from '@/components/jobs/JobDetailModal'; // Adjust import path if needed

// Force dynamic rendering for now if data is mutable, or static params if static
export const dynamic = 'force-dynamic';

interface Props {
    params: {
        id: string;
    };
}

// 1. Generate Metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const shop = (shopsData as Shop[]).find((s) => s.id === params.id);

    if (!shop) {
        return {
            title: '공고를 찾을 수 없습니다 - 코코알바',
        };
    }

    const simpleRegion = shop.region?.replace(/[\[\]]/g, '') || '전국';
    const keywords = generateSEOKeywords(shop.region).join(', ');

    return {
        title: `${shop.name} - ${simpleRegion} ${shop.category || '유흥'}알바 채용정보 | 코코알바`,
        description: `${simpleRegion} ${shop.name} 채용정보. ${shop.title || '최고의 대우로 모십니다.'} 급여: ${shop.pay || '협의'}`,
        keywords: keywords,
        openGraph: {
            title: `${shop.name} 채용정보 - 코코알바`,
            description: `${shop.title || '상세 요강을 확인하세요.'}`,
            // images: shop.imageUrl ? [shop.imageUrl] : [],
        },
    };
}

// 2. Page Component
export default function JobDetailPage({ params }: Props) {
    const shop = (shopsData as Shop[]).find((s) => s.id === params.id);

    if (!shop) {
        notFound();
    }

    return (
        <div className="w-full min-h-screen bg-gray-50 flex justify-center">
            <div className="w-full max-w-2xl bg-white shadow-lg min-h-screen">
                {/* Reusing existing JobDetailContent */}
                {/* Note: JobDetailContent is exported from JobDetailModal.tsx, make sure it's exported */}
                <JobDetailContent shop={shop} />
            </div>
        </div>
    );
}
