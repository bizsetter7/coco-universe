import React from 'react';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import JobClient from './JobClient';
import { Shop } from '@/types/shop';
import { enrichAdData } from '@/lib/adUtils';

export const dynamic = 'force-dynamic';

const OG_IMAGE = 'https://www.cocoalba.kr/og-image.jpg';

export const metadata: Metadata = {
    title: '업종별 채용 - 룸알바·노래방알바·노래빠알바·유흥알바 1위 코코알바',
    description: '룸알바, 노래방알바(노래빠알바), 노래주점, 텐프로, 바(Bar) 등 업종별 여성알바 정보. 전국 당일지급·숙식제공 검증 업체만 모았습니다.',
    keywords: ['노래빠알바', '노래방알바', '노래주점알바', '룸알바', '유흥알바', '밤알바', '텐프로알바', '여성알바', '고소득알바', '당일지급알바', '업종별알바'],
    alternates: {
        canonical: 'https://www.cocoalba.kr/jobs',
    },
    openGraph: {
        title: '룸알바·노래방알바·노래빠알바 1위 - 코코알바',
        description: '룸알바, 노래방알바(노래빠), 노래주점, 텐프로 업종별 여성알바. 당일지급·숙식제공 보장.',
        url: 'https://www.cocoalba.kr/jobs',
        siteName: '코코알바',
        images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: '코코알바 업종별 채용' }],
        type: 'website',
        locale: 'ko_KR',
    },
    twitter: {
        card: 'summary_large_image',
        title: '룸알바·노래방알바·노래빠알바 1위 - 코코알바',
        description: '룸알바, 노래방알바(노래빠), 노래주점, 텐프로 업종별 여성알바 정보.',
        images: [OG_IMAGE],
    },
};

export default async function JobPage() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase
        .from('shops')
        .select('*')
        .eq('platform', 'cocoalba')
        .eq('is_closed', false)
        .order('created_at', { ascending: false })
        .limit(500);

    // userData 조회 제거 — enrichAdData(ad, []) 통일 (메인페이지와 닉네임 폴백 일치)
    const rawShops: Shop[] = (data || []).map((ad: any) => enrichAdData(ad, []));

    // [Fix 2] 메인 페이지와 동일한 정렬 기준 (p1~p7 tier, 실제광고 우선)
    const getTierRank = (tier: string): number => {
        const t = (tier || '').toLowerCase();
        const O: Record<string, number> = { p1:1,grand:1,vip:1, p2:2,premium:2, p3:3,deluxe:3, p4:4,special:4, p5:5,urgent:5,recommended:5, p6:6,native:6, p7:7,basic:7,common:7 };
        return O[t] ?? 99;
    };
    const isMockAd = (ad: any) => ad.isMock === true || String(ad.user_id||'').startsWith('6fc68887') || String(ad.id||'').startsWith('AD_MOCK_');
    const reals = rawShops.filter(s => !isMockAd(s));
    const mocks = rawShops.filter(s => isMockAd(s));
    const visibleMocks = reals.length > 0 ? mocks.slice(0, Math.max(0, mocks.length - reals.length)) : mocks;
    const sortByTierDate = (arr: any[]) => arr.sort((a: any, b: any) => {
        const rA = getTierRank(a.tier), rB = getTierRank(b.tier);
        if (rA !== rB) return rA - rB;
        return new Date(b.created_at||0).getTime() - new Date(a.created_at||0).getTime();
    });
    // 실제광고는 tier 무관하게 목업보다 항상 앞에 표시
    const shops: Shop[] = [...sortByTierDate(reals), ...sortByTierDate(visibleMocks)];

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "노래빠알바(노래방알바)란 무엇인가요?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "노래빠알바는 노래주점에서 도우미로 근무하는 알바를 말합니다. 손님과 함께 노래를 즐기는 서비스를 제공하며, 일당 15만원~30만원 수준으로 처음 시작하는 분들에게 인기 있는 업종입니다. 코코알바에서 전국 노래방알바·노래주점알바 공고를 무료로 확인하세요."
                }
            },
            {
                "@type": "Question",
                "name": "노래빠알바와 룸알바 중 어떤 게 수입이 더 높나요?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "일반적으로 룸알바(룸싸롱)의 수입이 더 높으며, 노래빠알바(노래주점)는 상대적으로 진입 장벽이 낮아 처음 시작하는 분들이 많이 선택합니다. 코코알바에서 두 업종의 공고를 비교해보고 본인에게 맞는 조건을 찾아보세요."
                }
            },
            {
                "@type": "Question",
                "name": "당일지급되는 노래방알바를 찾는 방법은?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "코코알바에서 업종별 필터에서 '노래주점'을 선택하고 '당일지급' 조건을 확인하면 됩니다. 등록된 모든 업체는 코코알바에서 사전 검증을 거쳐 안전하게 일할 수 있는 곳만 안내합니다."
                }
            },
            {
                "@type": "Question",
                "name": "유흥알바 처음 시작할 때 어떤 업종이 좋나요?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "처음 시작하는 경우 노래빠알바(노래주점)나 바알바를 추천합니다. 룸알바, 텐프로 등 고급 업종은 수입이 높지만 경력이 필요한 경우가 많습니다. 코코알바 고객센터(1877-1442)에서 업종별 상담도 받을 수 있습니다."
                }
            },
            {
                "@type": "Question",
                "name": "전국 유흥알바·밤알바 1위 사이트는 어디인가요?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "코코알바(cocoalba.kr)는 룸알바, 노래방알바(노래빠알바), 텐프로, 유흥알바, 밤알바 등 전국 여성알바 정보를 제공하는 1위 플랫폼입니다. 당일지급·숙식제공 검증 업체만 등록되어 있습니다."
                }
            }
        ]
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://cocoalba.kr" },
            { "@type": "ListItem", "position": 2, "name": "업종별 채용", "item": "https://cocoalba.kr/jobs" }
        ]
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <JobClient shops={shops} />
        </>
    );
}
