'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBrand } from './BrandProvider';
import { useSearchParams } from 'next/navigation';
import { X, PhoneCall } from 'lucide-react';

interface BannerSidebarProps {
    side: 'left' | 'right';
}

/**
 * BannerSidebar - 'Extreme Speed' 로직 적용 버젼
 * - 사용자의 스크롤에 맞춰 0.1초의 짧은 지연시간으로 기민하게 반응
 * - 페이지 전환이나 도약 스크롤 시 'Transition-None' 즉시 이동 강제
 */
export const BannerSidebar = ({ side }: BannerSidebarProps) => {
    const brand = useBrand();
    const searchParams = useSearchParams();
    const [selectedAd, setSelectedAd] = useState<any>(null);
    const [topOffset, setTopOffset] = useState(16);
    const [isInstant, setIsInstant] = useState(true);
    const lastScrollY = useRef(0);

    // 1. 페이지/탭 전환 시 지연 없는 즉시 고정
    useEffect(() => {
        setIsInstant(true);
        setTopOffset(16);
        lastScrollY.current = 0;

        // 브라우저 렌더링 동기화를 위해 매우 짧은 대기 후 해제
        const timer = setTimeout(() => setIsInstant(false), 50);
        return () => clearTimeout(timer);
    }, [searchParams]);

    // 2. 가속 스크롤 및 상단 복귀 감지
    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = Math.max(0, window.scrollY);
            const scrollDiff = Math.abs(currentScroll - lastScrollY.current);

            // 1. 스크롤이 상단(0) 근처면 애니메이션 없이 칼같이 16px 고정
            if (currentScroll < 5) {
                setIsInstant(true);
                setTopOffset(16);
                lastScrollY.current = 0;
                return;
            }

            // 2. 50px 이상 큰 폭으로 움직이면 워프 모드 (transition-none)
            if (scrollDiff > 50) {
                setIsInstant(true);
                setTopOffset(currentScroll + 16);
                // 워프 직후 바로 부드러운 모드 복구
                requestAnimationFrame(() => setIsInstant(false));
            } else {
                // 3. 미세 스크롤 시에는 0.1초의 매우 빠른 속도로 따라옴
                setTopOffset(currentScroll + 16);
            }

            lastScrollY.current = currentScroll;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const ads = [
        { id: 1, name: '강남 유앤미', img: '/banners/thumb-1.png', desc: '강남구 역삼동 유앤미 힐링 케어' },
        { id: 2, name: '송파 루비', img: '/banners/thumb-2.png', desc: '송파 지역 1등 프리미엄 라운지' },
        { id: 3, name: '인천 스카이', img: '/banners/thumb-3.png', desc: '인천 연수동 스카이 테라피' },
    ];

    const badgeText = side === 'left' ? 'BEST AD' : 'PREMIUM';
    const badgeColor = side === 'left' ? 'bg-[#5B5FFF]' : 'bg-[#E91E63]';

    return (
        <>
            <aside
                className={`hidden xl:flex absolute ${side === 'left' ? 'left-[calc(50%-680px)]' : 'right-[calc(50%-680px)]'} w-[160px] flex-col gap-3 pointer-events-none z-40
                    ${isInstant ? 'transition-none' : 'transition-all duration-100 ease-out'}
                `}
                style={{ top: `${topOffset}px` }}
            >
                <div className={`${badgeColor} text-white text-[10px] font-black py-1.5 rounded-t-xl text-center shadow-sm pointer-events-auto`}>
                    {badgeText}
                </div>

                <div className="flex flex-col gap-2.5">
                    {ads.map((ad) => (
                        <div
                            key={ad.id}
                            onClick={() => setSelectedAd(ad)}
                            className="group pointer-events-auto bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all active:scale-95"
                        >
                            <div className="p-2.5 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="relative w-8 h-8 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img src={ad.img} alt={ad.name} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-[11px] font-black text-gray-700 dark:text-gray-200 truncate">{ad.name}</span>
                                </div>
                                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700">
                                    <img src={ad.img} alt={ad.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm pointer-events-auto text-center space-y-1">
                    <p className="text-[9px] text-gray-400 font-bold">배너 광고 문의</p>
                    <p className="text-[13px] font-black text-gray-800 dark:text-gray-100 italic">1544-5568</p>
                </div>
            </aside>

            {selectedAd && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedAd(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="relative aspect-video">
                            <img src={selectedAd.img} alt={selectedAd.name} className="w-full h-full object-cover" />
                            <button onClick={() => setSelectedAd(null)} className="absolute top-4 right-4 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <h2 className="text-xl font-black mb-2 dark:text-white">{selectedAd.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed break-keep mb-6">
                                {selectedAd.desc}
                            </p>
                            <a href={`tel:1544-5568`} className="flex items-center justify-center gap-2 w-full py-4 bg-[#E91E63] hover:bg-[#D81B60] text-white font-black rounded-2xl transition-all shadow-lg shadow-pink-100 dark:shadow-none">
                                <PhoneCall size={20} /> 실시간 문의하기
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
