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

    // Static slices for each tier
    const grandShops = shops.slice(0, 12);
    const premiumShops = shops.slice(12, 24);
    const deluxeShops = shops.slice(24, 36);
    const specialShops = shops.slice(36, 48);
    const urgentShops = shops.slice(48, 60);

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
                icon={<Star className="text-pink-500" fill="currentColor" />}
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
