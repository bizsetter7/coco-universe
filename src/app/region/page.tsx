import React from 'react';
import { createClient } from '@supabase/supabase-js';
import RegionClient from './RegionClient';
import { Shop } from '@/types/shop';

export const dynamic = 'force-dynamic';

export default async function RegionPage() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase
        .from('shops')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

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

    return <RegionClient shops={shops} />;
}
