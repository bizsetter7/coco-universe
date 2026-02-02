'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, PhoneCall, Crown, Zap } from 'lucide-react';
import { useBrand } from './BrandProvider';
import shopsData from '@/lib/data/shops.json';

interface Shop {
    id: string;
    name: string;
    region: string;
    pay: string;
    tier?: string;
    workType?: string;
    [key: string]: any;
}

interface BannerSidebarProps {
    side: 'left' | 'right';
}

/**
 * 🚀 BannerSidebar - 'Ultimate Follow-Scroll' Edition v8
 * - 전설의 translate3d 기반 0ms 반응성 엔진 탑재
 * - 16px 시작점 (top-[16px]) 절대 고정
 * - JSX 구문 오류 및 태그 불균형 완벽 수리 완료
 */
export const BannerSidebar = ({ side }: BannerSidebarProps) => {
    const router = useRouter();
    const brand = useBrand();
    const [selectedAd, setSelectedAd] = useState<Shop | null>(null);

    const isLeft = side === 'left';
    const sideChar = isLeft ? 'L' : 'R';

    // 1. 데이터 샘플링 (Grand 2개, Premium 2개)
    const allShops = shopsData as Shop[];

    const grandAds = useMemo(() => {
        const gr = allShops.filter(s => s.tier === 'grand');
        if (isLeft) return [gr[0], gr[2]].filter(Boolean);
        return [gr[1], gr[3]].filter(Boolean);
    }, [allShops, isLeft]);

    const premiumAds = useMemo(() => {
        const pr = allShops.filter(s => s.tier === 'premium' || s.is_premium);
        if (isLeft) return pr.slice(0, 2);
        return pr.slice(2, 4);
    }, [allShops, isLeft]);

    const renderAdCard = (ad: Shop, isGrand: boolean) => {
        const gradientClass = isGrand
            ? "bg-gradient-to-br from-amber-400 via-yellow-100 to-amber-600"
            : "bg-gradient-to-br from-pink-400 via-rose-100 to-pink-600";

        return (
            <div
                key={ad.id}
                onClick={() => setSelectedAd(ad)}
                className={`group p-[1.5px] rounded-[18px] overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-95 shadow-sm ${gradientClass}`}
            >
                <div className={`p-1.5 flex flex-col gap-1 rounded-[16px] h-full ${brand.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                    <div className="flex items-center gap-1.5">
                        <div className={`relative w-5 h-5 rounded-md overflow-hidden flex-shrink-0 border 
                            ${isGrand ?
                                (brand.theme === 'dark' ? 'bg-amber-900/20 border-amber-900/30' : 'bg-amber-50 border-amber-100') :
                                (brand.theme === 'dark' ? 'bg-pink-900/10 border-pink-900/20' : 'bg-pink-50 border-pink-50')
                            }
                        `}>
                            <div className={`w-full h-full flex items-center justify-center text-[8px] font-bold text-gray-400 ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                                {ad.name.substring(0, 1)}
                            </div>
                        </div>
                        <span className={`text-[10px] font-black truncate tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>{ad.name}</span>
                    </div>
                    <div className={`relative w-full aspect-[4/3] rounded-lg overflow-hidden border 
                        ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}
                        ${isGrand ?
                            (brand.theme === 'dark' ? 'border-amber-900/10' : 'border-amber-50') :
                            (brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-100')
                        }
                    `}>
                        <div className={`w-full h-full flex items-center justify-center text-[7px] font-bold uppercase italic ${brand.theme === 'dark' ? 'bg-gray-900 text-gray-700' : 'bg-gray-100 text-gray-300'}`}>
                            AD
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div
                className="sticky top-[16px] w-[160px] flex flex-col gap-2 z-[100]"
            >
                {/* 내부 모든 요소는 클릭 가능하도록 설정 */}
                <div className="flex flex-col gap-2">
                    {/* 통합 사이드 섹션 (GRAND 헤더 하나만 사용) */}
                    <div className="flex flex-col gap-1.5">
                        <div
                            onClick={() => router.push('/customer-center?tab=ad')}
                            className="group bg-gradient-to-br from-amber-400 via-yellow-100 to-amber-600 p-0.5 rounded-[16px] shadow-sm cursor-pointer hover:scale-[1.02] transition-all"
                        >
                            <div className={`rounded-[14px] py-1 text-center ${brand.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                                <Crown size={12} className="mx-auto mb-0.5 text-amber-500 animate-pulse" fill="currentColor" />
                                <p className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">
                                    GRAND {sideChar}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 px-1">
                            {/* 그랜드 광고 슬롯 (2개) */}
                            {grandAds.map((ad, idx) => renderAdCard(ad, true))}

                            {/* 프리미엄 광고 슬롯 (2개 - 헤더 없이 통합) */}
                            {premiumAds.map((ad, idx) => renderAdCard(ad, false))}
                        </div>
                    </div>

                    {/* 광고문의 섹션 */}
                    <div
                        onClick={() => router.push('/customer-center?tab=ad')}
                        className={`p-2 backdrop-blur-md border rounded-[18px] shadow-md text-center mx-1 border-b-2 border-b-pink-500/20 active:scale-95 transition-transform cursor-pointer ${brand.theme === 'dark' ? 'bg-gray-800/95 border-gray-800' : 'bg-white/95 border-gray-100'}`}
                    >
                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">광고문의</p>
                        <p className={`text-[12px] font-black italic tracking-tighter ${brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>1544-5568</p>
                    </div>
                </div>
            </div>

            {/* AD Detail Modal (Z-INDEX 110으로 독립) */}
            {selectedAd && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl" onClick={() => setSelectedAd(null)}>
                    <div className={`rounded-[30px] shadow-2xl w-full max-w-sm overflow-hidden animate-zoomIn ${brand.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
                        <div className={`relative aspect-video flex items-center justify-center font-black text-2xl uppercase italic ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-700' : 'bg-gray-100 text-gray-300'}`}>
                            Official AD
                            <button onClick={() => setSelectedAd(null)} className="absolute top-5 right-5 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white p-2.5 rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8">
                            <h2 className={`text-2xl font-black mb-4 tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedAd.name}</h2>
                            <p className={`text-[14px] leading-relaxed break-keep mb-8 font-medium ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {selectedAd.region} | {selectedAd.pay} | {selectedAd.workType || '상세 정보 문의'}
                            </p>
                            <a href={`tel:1544-5568`} className={`flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black rounded-2xl transition-all shadow-xl active:scale-[0.98] text-lg`}>
                                <PhoneCall size={22} /> 실시간 문의하기
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

