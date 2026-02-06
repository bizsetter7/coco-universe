'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Shop } from '@/types/shop';
import { ShopCard } from '@/components/shop/ShopCard';
import { useBrand } from '@/components/BrandProvider';

interface AdSectionProps {
    title: string;
    icon: React.ReactNode;
    shops: Shop[];
    tierId: string;
    onAdRegister: (tier: string) => void;
    rowCountPC: number;
    onSelectShop?: (shop: Shop) => void;
    columns?: 3 | 4; // New Prop to control grid columns
}

export const AdSection = React.memo(({ title, icon, shops, tierId, onAdRegister, rowCountPC, onSelectShop, columns = 4 }: AdSectionProps) => {
    const brand = useBrand();
    const isDark = brand.theme === 'dark';
    const totalPC = columns * rowCountPC; // Adjust slice count based on columns
    const totalMob = 6;

    // Grid Class Logic
    // If columns=4 (Main Page): grid-cols-2 md:grid-cols-4
    // If columns=3 (Sub Pages): grid-cols-2 md:grid-cols-3
    const gridClass = columns === 4
        ? "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        : "grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4";

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
            <div className={gridClass}>
                {shops.slice(0, totalPC).map((shop, idx) => (
                    <div key={shop.id || idx} className={`${idx >= totalMob ? 'hidden md:block' : ''}`}>
                        <div onClick={() => onSelectShop && onSelectShop(shop)} className="cursor-pointer">
                            <ShopCard
                                shop={shop}
                                tierLabel={tierId === 'grand' ? 'GRAND' : tierId === 'premium' ? 'PREMIUM' : tierId === 'deluxe' ? 'DELUXE' : tierId === 'special' ? 'SPECIAL' : 'URGENT'}
                            />
                        </div>
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
