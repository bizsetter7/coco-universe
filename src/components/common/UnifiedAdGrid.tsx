'use client';

import React from 'react';
import { Crown, Trophy, Sparkles, Flame, Star } from 'lucide-react';
import { Shop } from '@/types/shop';
import { AdSection } from './AdSection';
import { AdSectionSkeleton } from './AdSectionSkeleton';

interface UnifiedAdGridProps {
    shops: Shop[] | null; // Allow null for loading
    isLoading?: boolean;
    onAdRegister: (tier: string) => void;
    onSelectShop: (shop: Shop) => void;
    hasSidebar?: boolean;
}

export const UnifiedAdGrid = ({ shops, isLoading, onAdRegister, onSelectShop, hasSidebar }: UnifiedAdGridProps) => {

    if (isLoading || !shops) {
        return (
            <div className="w-full">
                <AdSectionSkeleton title="그랜드 채용" rowCountPC={2} />
                <AdSectionSkeleton title="프리미엄 채용" rowCountPC={2} />
                <AdSectionSkeleton title="디럭스 채용" rowCountPC={2} />
            </div>
        );
    }

    // [2026-03-22] Tier-based filtering — altId('grand') 및 id('p1') 양쪽 지원
    // Supabase 실제 등록 공고는 tier='p1'~'p7', 샘플 데이터는 tier='grand'/'premium' 등 altId 형식
    const isTier = (s: Shop, altId: string, id: string) =>
        s.tier === altId || s.tier === id;

    const grandShops   = shops.filter(s => isTier(s, 'grand', 'p1'));
    const premiumShops = shops.filter(s => isTier(s, 'premium', 'p2') || (s as any).is_premium);
    const deluxeShops  = shops.filter(s => isTier(s, 'deluxe', 'p3'));
    const specialShops = shops.filter(s => isTier(s, 'special', 'p4'));
    const urgentShops  = shops.filter(s =>
        isTier(s, 'urgent', 'p5') || isTier(s, 'recommended', 'p5') ||
        isTier(s, 'native', 'p6') || isTier(s, 'basic', 'p7')
    );

    return (
        <div className="w-full">
            {/* 1. Grand */}
            <AdSection
                title="그랜드 채용"
                icon={<Crown className="text-amber-500" fill="currentColor" />}
                shops={grandShops}
                tierId="grand"
                rowCountPC={3}
                onAdRegister={onAdRegister}
                onSelectShop={onSelectShop}
                hasSidebar={hasSidebar}
            />

            {/* 2. Premium */}
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

            {/* 3. Deluxe */}
            <AdSection
                title="디럭스 채용"
                icon={<Sparkles className="text-blue-500" fill="currentColor" />}
                shops={deluxeShops}
                tierId="deluxe"
                rowCountPC={2}
                onAdRegister={onAdRegister}
                onSelectShop={onSelectShop}
                hasSidebar={hasSidebar}
            />

            {/* 4. Special */}
            <AdSection
                title="스페셜 채용"
                icon={<Star className="text-blue-500" fill="currentColor" />}
                shops={specialShops}
                tierId="special"
                rowCountPC={2}
                onAdRegister={onAdRegister}
                onSelectShop={onSelectShop}
                hasSidebar={hasSidebar}
            />

            {/* 5. Urgent */}
            <AdSection
                title="급구/추천"
                icon={<Flame className="text-red-500" fill="currentColor" />}
                shops={urgentShops}
                tierId="urgent"
                rowCountPC={2}
                onAdRegister={onAdRegister}
                onSelectShop={onSelectShop}
                hasSidebar={hasSidebar}
            />
        </div>
    );
};
