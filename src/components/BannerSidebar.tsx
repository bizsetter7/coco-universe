'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Crown } from 'lucide-react';
import { Shop } from '@/types/shop';
import { useBrand } from './BrandProvider';
import { useMobile } from '@/hooks/useMobile';
import { formatKoreanMoney } from '@/utils/formatMoney';
import { getPayColor } from '@/utils/payColors';
import JobDetailModal from './jobs/JobDetailModal';

// [Optimization] Memoized Sub-component to prevent unnecessary re-renders
const SideAdCard = React.memo(({ ad, onSelect }: { ad: Shop, onSelect: (shop: Shop) => void }) => {
    // Premium Gradient Generator for Text Banners
    const getPremiumGradient = (id: string) => {
        const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const gradients = [
            'from-slate-800 to-slate-900',
            'from-indigo-800 to-purple-900',
            'from-rose-800 to-red-900',
            'from-blue-800 to-indigo-900',
            'from-emerald-800 to-teal-900',
            'from-amber-700 to-orange-800',
        ];
        return gradients[hash % gradients.length];
    };

    // 2. Badge handling
    const getBadgeChar = () => {
        if (ad.payType) return ad.payType.substring(0, 1);
        if (ad.pay === '면접후결정') return '면';
        return '시';
    };

    const badgeChar = getBadgeChar();

    return (
        <div
            onClick={() => onSelect(ad)}
            className="group relative w-full h-[140px] bg-white rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all border border-gray-100 flex flex-col"
        >
            {/* 1. Header: Premium Text Banner (No Image) */}
            <div className={`relative w-full h-[85px] overflow-hidden shrink-0 flex items-center justify-center bg-gradient-to-br ${getPremiumGradient(ad.id)}`}>
                <div className="relative z-10 px-2 text-center">
                    <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest mb-1 block leading-none">{ad.workType || 'JOB'}</span>
                    <h4 className="text-white font-black text-[12px] leading-tight drop-shadow-md break-keep">
                        {ad.title || ad.name}
                    </h4>
                    <div className="w-6 h-0.5 bg-white/20 mx-auto mt-1.5 rounded-full" />
                </div>
            </div>

            {/* 2. Content Area */}
            <div className="px-3 py-2 flex flex-col justify-center flex-1 bg-white gap-1.5">
                <h4 className="text-[11px] font-bold text-gray-800 leading-tight truncate tracking-tight">
                    {ad.title || ad.name}
                </h4>

                <div className="flex items-center gap-1">
                    <span className={`shrink-0 w-[14px] h-[14px] flex items-center justify-center rounded-[3px] shadow-sm relative overflow-hidden ${getPayColor(ad.payType || (badgeChar === '면' ? '협의' : ''))} `} style={{ backgroundColor: badgeChar === '면' ? '#6b7280' : undefined }}>
                        <span className="text-[9px] font-bold text-white leading-none absolute inset-0 flex items-center justify-center z-20 pt-[1px]">
                            {badgeChar}
                        </span>
                    </span>
                    <div className="text-[10px] font-black text-gray-900 tracking-tighter">
                        {formatKoreanMoney(ad.pay)}
                    </div>
                </div>
            </div>
        </div>
    );
});
SideAdCard.displayName = 'SideAdCard';

interface BannerSidebarProps {
    side: 'left' | 'right';
    shops: Shop[];
}

import { useBannerControl } from '@/hooks/useBannerControl';

// [Optimization] Main Component Memoization
export const BannerSidebar = React.memo(({ side, shops }: BannerSidebarProps) => {
    const router = useRouter();
    const brand = useBrand();
    const isMobile = useMobile();
    const isVisible = useBannerControl(); // Global + Manual Control
    const [selectedAd, setSelectedAd] = useState<Shop | null>(null);
    const [favorites, setFavorites] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem('favorites');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    const toggleFavorite = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newFavs = favorites.includes(id)
            ? favorites.filter(fid => fid !== id)
            : [...favorites, id];
        setFavorites(newFavs);
        localStorage.setItem('favorites', JSON.stringify(newFavs));
    };

    const isLeft = side === 'left';
    const sideChar = isLeft ? 'L' : 'R';

    // [Optimization] wrap external props to avoid dependency warnings
    const allShops = useMemo(() => shops || [], [shops]);

    const grandAds = useMemo(() => {
        if (isMobile) return [];
        const gr = allShops.filter(s => s.tier === 'grand');
        if (isLeft) return [gr[0], gr[2]].filter(Boolean);
        return [gr[1], gr[3]].filter(Boolean);
    }, [allShops, isLeft, isMobile]);

    const premiumAds = useMemo(() => {
        if (isMobile) return [];
        const pr = allShops.filter(s => s.tier === 'premium' || s.is_premium);
        if (isLeft) return pr.slice(0, 2);
        return pr.slice(2, 4);
    }, [allShops, isLeft, isMobile]);

    // [Optimization] Valid Return for Mobile after hooks are called
    if (isMobile) return null;

    if (!isVisible && !selectedAd) return null;

    // [Optimization] Removed backdrop-blur-md, replaced with solid bg/opacity to reduce paint cost
    const contactBoxClass = brand.theme === 'dark'
        ? 'bg-gray-800/95 border-gray-800'
        : 'bg-white/95 border-gray-100';

    return (
        <>
            <div className={`flex flex-col gap-2 w-full pt-0`}>
                <div className="flex flex-col gap-2 pb-4">
                    <div className="flex flex-col gap-1.5">
                        <div
                            onClick={() => router.push('/customer-center?tab=ad')}
                            className="group bg-gradient-to-br from-amber-400 via-yellow-100 to-amber-600 p-0.5 rounded-[16px] shadow-sm cursor-pointer hover:scale-[1.02] transition-all will-change-transform"
                        >
                            <div className={`rounded-[14px] py-1 text-center ${brand.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                                <Crown size={12} className="mx-auto mb-0.5 text-amber-500 animate-pulse" fill="currentColor" />
                                <p className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">
                                    GRAND {sideChar}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 px-1">
                            {grandAds.map((ad) => (
                                <SideAdCard key={ad.id} ad={ad} onSelect={setSelectedAd} />
                            ))}
                            {premiumAds.map((ad) => (
                                <SideAdCard key={ad.id} ad={ad} onSelect={setSelectedAd} />
                            ))}
                        </div>
                    </div>

                    <div
                        onClick={() => router.push('/customer-center?tab=inquiry')}
                        className={`p-2 border rounded-[18px] shadow-md text-center mx-1 border-b-2 border-b-pink-500/20 active:scale-95 transition-transform cursor-pointer ${contactBoxClass}`}
                    >
                        <p className="text-[10px] text-blue-600 font-extrabold mb-0.5">광고입점상담</p>
                        <p className={`text-[13px] font-black tracking-tighter ${brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{"<1:1문의>"}</p>
                    </div>
                </div>
            </div>

            {selectedAd && (
                <JobDetailModal
                    shop={selectedAd}
                    onClose={() => setSelectedAd(null)}
                    isFavorite={favorites.includes(selectedAd.id)}
                    onToggleFavorite={(e) => toggleFavorite(e, selectedAd.id)}
                />
            )}
        </>
    );
});
BannerSidebar.displayName = 'BannerSidebar';
