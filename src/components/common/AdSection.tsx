'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Shop } from '@/types/shop';
import { ShopCard } from '@/components/shop/ShopCard';
import { useBrand } from '@/components/BrandProvider';
import { AdBannerCard } from '@/components/shop/AdBannerCard';

interface AdSectionProps {
    title: string;
    icon: React.ReactNode;
    shops: Shop[];
    tierId: string;
    onAdRegister: (tier: string) => void;
    rowCountPC: number;
    onSelectShop?: (shop: Shop) => void;
}

export const AdSection = React.memo(({ title, icon, shops, tierId, onAdRegister, rowCountPC, onSelectShop }: AdSectionProps) => {
    const brand = useBrand();
    const isDark = brand.theme === 'dark';

    // [Tier-based Grid Settings Map]
    const GRID_CONFIGS: Record<string, { gridClass: string, totalPC: number, totalMob: number, label: string }> = {
        grand: { gridClass: "grid-cols-2 md:grid-cols-4", totalPC: 12, totalMob: 6, label: 'GRAND' },
        premium: { gridClass: "grid-cols-2 md:grid-cols-5", totalPC: 15, totalMob: 6, label: 'PREMIUM' },
        deluxe: { gridClass: "grid-cols-2 md:grid-cols-6", totalPC: 18, totalMob: 8, label: 'DELUXE' },
        special: { gridClass: "grid-cols-2 md:grid-cols-6", totalPC: 18, totalMob: 8, label: 'SPECIAL' },
        urgent: { gridClass: "grid-cols-2 md:grid-cols-6", totalPC: 18, totalMob: 6, label: 'URGENT' },
        recommended: { gridClass: "grid-cols-2 md:grid-cols-6", totalPC: 18, totalMob: 6, label: 'RECOMMENDED' }
    };

    const config = GRID_CONFIGS[tierId] || GRID_CONFIGS.grand;
    const gridClass = `grid gap-2 md:gap-3 ${config.gridClass}`;
    const { totalPC, totalMob, label: tierLabel } = config;

    const isHighTier = tierId === 'grand' || tierId === 'premium';

    return (
        <section className="mb-12 relative px-4 xl:px-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {icon}
                    <h2 className={`text-xl md:text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
                </div>
                <button
                    onClick={() => onAdRegister(tierId)}
                    className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-bold bg-pink-600 hover:bg-pink-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-1"
                >
                    <span>광고신청</span>
                    <ChevronRight size={14} />
                </button>
            </div>

            {/* Grid */}
            <div className={`${gridClass} items-start`}>
                {shops.slice(0, totalPC).map((shop, idx) => (
                    <div key={shop.id || idx} className={`${idx >= totalMob ? 'hidden md:block' : ''}`}>
                        {isHighTier ? (
                            <div onClick={() => onSelectShop && onSelectShop(shop)} className="cursor-pointer">
                                <AdBannerCard shop={shop} />
                            </div>
                        ) : (
                            <ShopCard
                                shop={shop}
                                tierId={tierId}
                                tierLabel={tierLabel}
                                onClick={() => onSelectShop && onSelectShop(shop)}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-center">
                <button
                    className={`px-6 py-3 rounded-xl border-2 font-bold text-sm flex items-center gap-2 transition-all ${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'}`}
                >
                    {title} 공고 더보기 <ChevronRight size={16} />
                </button>
            </div>
        </section>
    );
});
AdSection.displayName = 'AdSection';
