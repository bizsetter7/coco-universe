'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Star } from 'lucide-react';
import { Shop } from '@/types/shop';
import { AdSection } from './AdSection';
import { AdSectionSkeleton } from './AdSectionSkeleton';
import { supabase } from '@/lib/supabase';

interface UnifiedAdGridProps {
    shops: Shop[] | null; // Allow null for loading
    isLoading?: boolean;
    onAdRegister: (tier: string) => void;
    onSelectShop: (shop: Shop) => void;
    hasSidebar?: boolean;
}

export const UnifiedAdGrid = ({ shops, isLoading, onAdRegister, onSelectShop, hasSidebar }: UnifiedAdGridProps) => {
    // 야사장 프리미엄 구독자 owner_id 목록 — T2 섹션 표시 기준
    const [yajangPremiumIds, setYajangPremiumIds] = useState<Set<string> | null>(null);

    useEffect(() => {
        supabase
            .from('businesses')
            .select('owner_id')
            .eq('cocoalba_tier', 'premium')
            .then(({ data }) => {
                setYajangPremiumIds(new Set((data || []).map((b: any) => String(b.owner_id || '')).filter(Boolean)));
            });
    }, []);

    if (isLoading || !shops) {
        return (
            <div className="w-full">
                <AdSectionSkeleton title="프리미엄 채용" rowCountPC={2} />
            </div>
        );
    }

    const T1_T2 = new Set(['grand', 'p1', 'vip', 'premium', 'p2']);

    // T2: 야사장 프리미엄 구독자만 — 로드 전(null)은 tier 기반 임시 표시, 로드 후엔 정확히 필터
    const premiumShops = shops.filter(s => {
        const t = (s.tier ?? '').toLowerCase();
        if (t !== 'premium' && t !== 'p2') return false;
        if (yajangPremiumIds === null) return true;
        return yajangPremiumIds.has(String((s as any).user_id || ''));
    });

    // T3: 프리미엄/그랜드 제외한 모든 광고 (standard·special·deluxe·basic 등)
    const t3Shops = shops.filter(s => {
        const t = (s.tier ?? '').toLowerCase();
        return !T1_T2.has(t);
    });

    if (premiumShops.length === 0 && t3Shops.length === 0) return null;

    return (
        <div className="w-full">
            {/* T2. 프리미엄 채용 — 야사장 프리미엄 구독 업체만 */}
            {premiumShops.length > 0 && (
                <AdSection
                    title="프리미엄 채용"
                    icon={<Trophy className="text-slate-500" fill="currentColor" />}
                    shops={premiumShops}
                    tierId="premium"
                    rowCountPC={3}
                    onAdRegister={onAdRegister}
                    onSelectShop={onSelectShop}
                    hasSidebar={hasSidebar}
                />
            )}
            {/* T3. 구인광고 — 프리미엄 외 전체 광고 */}
            {t3Shops.length > 0 && (
                <AdSection
                    title="구인광고"
                    icon={<Star className="text-amber-400" fill="currentColor" />}
                    shops={t3Shops}
                    tierId="standard"
                    rowCountPC={3}
                    onAdRegister={onAdRegister}
                    onSelectShop={onSelectShop}
                    hasSidebar={hasSidebar}
                />
            )}
        </div>
    );
};
