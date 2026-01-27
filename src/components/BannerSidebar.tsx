'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, PhoneCall, Crown, Zap } from 'lucide-react';
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
    const [selectedAd, setSelectedAd] = useState<Shop | null>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const isLeft = side === 'left';
    const sideChar = isLeft ? 'L' : 'R';

    // 1. 데이터 샘플링 (사용자 요청 수량: Grand 1, Premium 2)
    const allShops = shopsData as Shop[];

    const grandAds = useMemo(() => {
        const gr = allShops.filter(s => s.tier === 'grand');
        return gr.slice(isLeft ? 0 : 1, isLeft ? 1 : 2);
    }, [allShops, isLeft]);

    const premiumAds = useMemo(() => {
        const pr = allShops.filter(s => s.tier === 'premium' || s.is_premium);
        return pr.slice(isLeft ? 0 : 2, isLeft ? 2 : 4);
    }, [allShops, isLeft]);

    // 🚀 [Ultimate Engine] translate3d 기반 하드웨어 가속 추적
    useEffect(() => {
        const updatePosition = () => {
            if (!sidebarRef.current) return;
            const scrollY = window.scrollY;
            // 16px 마스터링: 스크롤 시에도 viewport 상단에서 16px 유지
            sidebarRef.current.style.transform = `translate3d(0, ${scrollY}px, 0)`;
        };

        const handleWarp = () => {
            if (sidebarRef.current) {
                sidebarRef.current.classList.add('no-transition');
                sidebarRef.current.style.transform = `translate3d(0, 0, 0)`;
                setTimeout(() => {
                    sidebarRef.current?.classList.remove('no-transition');
                }, 10);
            }
        };

        window.addEventListener('scroll', updatePosition, { passive: true });
        window.addEventListener('sidebar-warp', handleWarp);

        // 초기 위치 즉시 보정
        updatePosition();

        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('sidebar-warp', handleWarp);
        };
    }, []);

    const renderAdCard = (ad: Shop, isGrand: boolean) => (
        <div
            key={ad.id}
            onClick={() => setSelectedAd(ad)}
            className={`group bg-white dark:bg-gray-900 border overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-95 shadow-sm
                ${isGrand ? 'border-amber-100 dark:border-amber-900/30 rounded-[18px] border-2 ring-1 ring-amber-50 dark:ring-amber-900/10' : 'border-gray-100 dark:border-gray-800 rounded-[14px]'}
            `}
        >
            <div className="p-1.5 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                    <div className={`relative w-5 h-5 rounded-md overflow-hidden flex-shrink-0 border 
                        ${isGrand ? 'bg-amber-50 border-amber-100' : 'bg-pink-50 border-pink-50'}
                    `}>
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-[8px] font-bold text-gray-400">
                            {ad.name.substring(0, 1)}
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-gray-800 dark:text-gray-100 truncate tracking-tighter">{ad.name}</span>
                </div>
                <div className={`relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 border 
                    ${isGrand ? 'border-amber-50 dark:border-amber-900/10' : 'border-gray-100 dark:border-gray-700'}
                `}>
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-[7px] font-bold text-gray-300 dark:text-gray-700 uppercase italic">
                        AD
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div
                ref={sidebarRef}
                className="absolute top-[16px] w-[160px] flex flex-col gap-2 z-[100] will-change-transform pointer-events-none"
            >
                {/* 내부 모든 요소는 클릭 가능하도록 설정 */}
                <div className="flex flex-col gap-2 pointer-events-auto">
                    {/* 1. GRAND SIDE SECTION (1개) */}
                    <div className="flex flex-col gap-1.5">
                        <div
                            onClick={() => router.push('/customer-center?tab=ad')}
                            className="group bg-gradient-to-br from-amber-400 via-yellow-100 to-amber-600 p-0.5 rounded-[16px] shadow-sm cursor-pointer hover:scale-[1.02] transition-all"
                        >
                            <div className="bg-white dark:bg-gray-900 rounded-[14px] py-1 text-center">
                                <Crown size={12} className="mx-auto mb-0.5 text-amber-500 animate-pulse" fill="currentColor" />
                                <p className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">
                                    GRAND {sideChar}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 px-1">
                            {grandAds.map((ad) => renderAdCard(ad, true))}
                        </div>
                    </div>

                    {/* 2. PREMIUM SIDE SECTION (2개) */}
                    <div className="flex flex-col gap-1.5">
                        <div
                            onClick={() => router.push('/customer-center?tab=ad')}
                            className="group bg-gradient-to-br from-pink-400 via-rose-100 to-pink-600 p-0.5 rounded-[16px] shadow-sm cursor-pointer hover:scale-[1.02] transition-all"
                        >
                            <div className="bg-white dark:bg-gray-900 rounded-[14px] py-1 text-center">
                                <Zap size={12} className="mx-auto mb-0.5 text-pink-500 animate-bounce" fill="currentColor" />
                                <p className="text-[9px] font-black text-pink-600 uppercase tracking-tighter">
                                    PREMIUM {sideChar}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 px-1">
                            {premiumAds.map((ad) => renderAdCard(ad, false))}
                        </div>
                    </div>

                    {/* 광고문의 섹션 (사용자 요청 위치) */}
                    <div
                        onClick={() => router.push('/customer-center?tab=ad')}
                        className="p-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-100 dark:border-gray-800 rounded-[18px] shadow-md text-center mx-1 border-b-2 border-b-pink-500/20 active:scale-95 transition-transform cursor-pointer mt-1"
                    >
                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em] mb-0.5">광고문의</p>
                        <p className="text-[12px] font-black text-gray-900 dark:text-gray-100 italic tracking-tighter">1544-5568</p>
                    </div>
                </div>
            </div>

            {/* AD Detail Modal (Z-INDEX 110으로 독립) */}
            {selectedAd && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl" onClick={() => setSelectedAd(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-[30px] shadow-2xl w-full max-w-sm overflow-hidden animate-zoomIn" onClick={e => e.stopPropagation()}>
                        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-700 font-black text-2xl uppercase italic">
                            Official AD
                            <button onClick={() => setSelectedAd(null)} className="absolute top-5 right-5 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white p-2.5 rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8">
                            <h2 className="text-2xl font-black mb-4 dark:text-white tracking-tighter">{selectedAd.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-[14px] leading-relaxed break-keep mb-8 font-medium">
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
