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

    // [2026-03-22] 단일 pass로 전 tier 분류 (altId / p-id 양쪽 지원)
    const { grandShops, premiumShops, deluxeShops, specialShops, urgentShops } = shops.reduce(
        (acc, s) => {
            const t = s.tier ?? '';
            if (t === 'grand'   || t === 'p1') acc.grandShops.push(s);
            else if (t === 'premium' || t === 'p2') acc.premiumShops.push(s);
            else if (t === 'deluxe'  || t === 'p3') acc.deluxeShops.push(s);
            else if (t === 'special' || t === 'p4') acc.specialShops.push(s);
            else if (t === 'urgent' || t === 'recommended' || t === 'p5'
                  || t === 'native' || t === 'p6'
                  || t === 'basic'  || t === 'p7') acc.urgentShops.push(s);
            return acc;
        },
        {
            grandShops:   [] as Shop[],
            premiumShops: [] as Shop[],
            deluxeShops:  [] as Shop[],
            specialShops: [] as Shop[],
            urgentShops:  [] as Shop[],
        }
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
