import React from 'react';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import JobClient from './JobClient';
import { Shop } from '@/types/shop';

export const dynamic = 'force-dynamic';

const OG_IMAGE = 'https://www.cocoalba.kr/og-image.jpg';

export const metadata: Metadata = {
    title: '업종별 채용 - 1위 여성알바 코코알바',
    description: '원하는 업종별로 쉽고 빠르게 채용 공고를 찾아보세요. 룸알바, 노래주점, 바(Bar) 등 다양한 직종의 엔터프라이즈 알바 정보.',
    keywords: ['업종별알바', '여성알바', '룸알바', '노래방알바', '유흥알바', '밤알바', '고소득알바', '당일지급알바'],
    openGraph: {
        title: '업종별 채용 - 코코알바',
        description: '룸알바, 노래주점, 바(Bar) 등 업종별 여성알바 정보. 당일지급·숙식제공 보장.',
        url: 'https://cocoalba.kr/jobs',
        siteName: '코코알바',
        images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: '코코알바 업종별 채용' }],
        type: 'website',
        locale: 'ko_KR',
    },
    twitter: {
        card: 'summary_large_image',
        title: '업종별 채용 - 코코알바',
        description: '룸알바, 노래주점, 바(Bar) 등 업종별 여성알바 정보.',
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

    return <JobClient shops={shops} />;
}
