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
import { getFavorites, toggleFavorite as toggleFav, saveShopSnapshot } from '@/utils/favorites';

// [Optimization] Memoized Sub-component to prevent unnecessary re-renders
const SideAdCard = React.memo(({ ad, onSelect }: { ad: Shop, onSelect: (shop: Shop) => void }) => {
    // AD_TIER_STANDARDS 동기화 — 등급별 고정 그라디언트 (2026-03-22)
    const getTierGradient = (tier: string): string => {
        switch (tier) {
            case 'grand':       return 'from-amber-500 to-amber-600';      // 🟡 Grand
            case 'premium':     return 'from-red-600 to-red-700';           // 🔴 Premium
            case 'deluxe':      return 'from-blue-600 to-blue-700';         // 🔵 Deluxe
            case 'special':     return 'from-emerald-600 to-emerald-700';   // 🟢 Special
            case 'urgent':      return 'from-purple-600 to-purple-700';      // 🟣 Urgent/Recommended
            case 'recommended': return 'from-purple-600 to-purple-700';     // 🟣 Urgent/Recommended
            case 'native':      return 'from-slate-600 to-slate-700';       // ⬛ Native
            default:            return 'from-stone-700 to-stone-800';       // 🪨 Basic
        }
    };

    const hasImage = !!ad.options?.mediaUrl;
    const badgeChar = ad.payType?.substring(0, 1) || (String(ad.pay) === '면접후결정' ? '면' : '시');
    const paySuffixes: string[] = ad.options?.paySuffixes || (ad.options as any)?.pay_suffixes || (ad as any).paySuffixes || [];

    return (
        <div
            onClick={() => onSelect(ad)}
            className="group relative w-full h-[140px] bg-white rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all border border-gray-100 flex flex-col"
        >
            {/* ── 이미지 섹션 (고정 80px) ── */}
            <div className={`relative w-full h-[80px] shrink-0 overflow-hidden ${!hasImage ? `bg-gradient-to-br ${getTierGradient(ad.tier || '')}` : ''}`}>
                {hasImage ? (
                    // 이미지 있을 경우: 이미지만 표시
                    <img
                        src={ad.options!.mediaUrl}
                        alt={ad.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    // 이미지 없을 경우: 제목 텍스트만 중앙 표시
                    <div className="absolute inset-0 flex items-center justify-center px-2">
                        <h4 className="text-white font-black text-[11px] leading-tight drop-shadow-md break-keep text-center line-clamp-3 w-full">
                            {ad.title || ad.name}
                        </h4>
                    </div>
                )}
            </div>

            {/* ── 하단 정보 섹션 (고정 60px) ── */}
            <div className="px-2 pt-1.5 pb-1 flex flex-col justify-between flex-1 bg-white overflow-hidden">

                {/* Row 1: 닉네임(좌) | 지역(우) */}
                <div className="flex justify-between items-baseline gap-1 min-w-0">
                    <span className="text-[9px] font-bold text-gray-700 truncate flex-1 leading-none">
                        {ad.nickname || ad.name}
                    </span>
                    <span className="text-[9px] font-semibold text-gray-400 truncate shrink-0 text-right leading-none">
                        {ad.region}
                    </span>
                </div>

                {/* Row 2: 급여종류배지+급여(좌) | 업종(우) */}
                <div className="flex justify-between items-center gap-1 min-w-0">
                    <div className="flex items-center gap-0.5 min-w-0">
                        <span className={`shrink-0 w-[13px] h-[13px] flex items-center justify-center rounded-[3px] text-[8px] font-black text-white leading-none ${getPayColor(ad.payType || '')}`}>
                            {badgeChar}
                        </span>
                        <span className="text-[10px] font-black text-gray-900 tracking-tighter truncate">
                            {formatKoreanMoney(ad.pay)}
                        </span>
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 truncate shrink-0 text-right max-w-[48%] leading-none">
                        {ad.workType}
                    </span>
                </div>

                {/* Row 3: 추가급여옵션 (paySuffixes) */}
                <div className="flex gap-0.5 overflow-hidden h-[14px] items-center">
                    {paySuffixes.slice(0, 3).map((s: string, i: number) => (
                        <span key={i} className="text-[8px] text-gray-400 font-medium bg-gray-50 px-1 rounded border border-gray-100 whitespace-nowrap leading-[13px]">
                            {s}
                        </span>
                    ))}
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
    const [favorites, setFavorites] = useState<string[]>(() => getFavorites());

    const toggleFavorite = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (selectedAd?.id === id) saveShopSnapshot(id, selectedAd);
        setFavorites(prev => toggleFav(id, prev));
    };

    const isLeft = side === 'left';
    const sideChar = isLeft ? 'L' : 'R';

    // [Optimization] wrap external props to avoid dependency warnings
    const allShops = useMemo(() => shops || [], [shops]);

    const grandAds = useMemo(() => {
        if (isMobile) return [];
        // tier: 'grand'(샘플/altId) 또는 'p1'(실제 등록) 양쪽 지원 (2026-03-22)
        const gr = allShops.filter(s => s.tier === 'grand' || s.tier === 'p1');
        if (isLeft) return [gr[0], gr[2]].filter(Boolean);
        return [gr[1], gr[3]].filter(Boolean);
    }, [allShops, isLeft, isMobile]);

    const premiumAds = useMemo(() => {
        if (isMobile) return [];
        // tier: 'premium'(샘플/altId) 또는 'p2'(실제 등록) 양쪽 지원 (2026-03-22)
        const pr = allShops.filter(s => s.tier === 'premium' || s.tier === 'p2' || s.is_premium);
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
