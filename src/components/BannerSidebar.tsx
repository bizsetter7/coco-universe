'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBrand } from './BrandProvider';
import { useSearchParams, usePathname } from 'next/navigation';
import { X, PhoneCall } from 'lucide-react';

interface BannerSidebarProps {
    side: 'left' | 'right';
}

/**
 * BannerSidebar - '16px 황금 정렬' 마스터 버전
 * - 홈 버튼 / 사장님 무료등록 버튼과 상단 16px 라인을 완벽히 일치시킴
 * - translate3d 기반 하드웨어 가속 추적 (0ms 반응성)
 * - z-[100] 및 pointer-events 설정으로 간섭 최소화
 */
export const BannerSidebar = ({ side }: BannerSidebarProps) => {
    const brand = useBrand();
    const pathname = usePathname();
    const [selectedAd, setSelectedAd] = useState<any>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const ads = [
        { id: 1, name: '강남 유앤미', img: '/banners/thumb-1.png', desc: '강남구 역삼동 유앤미 힐링 케어' },
        { id: 2, name: '송파 루비', img: '/banners/thumb-2.png', desc: '송파 지역 1등 프리미엄 라운지' },
        { id: 3, name: '인천 스카이', img: '/banners/thumb-3.png', desc: '인천 연수동 스카이 테라피' },
    ];

    const badgeColor = side === 'left' ? 'bg-[#5B5FFF]' : 'bg-[#E91E63]';

    useEffect(() => {
        const updatePosition = () => {
            if (!sidebarRef.current) return;
            const scrollY = window.scrollY;

            // [16px 마스터링]
            // 헤더 내부 버튼들과 정렬하기 위해 초기 위치를 16px로 셋팅
            // requestAnimationFrame 대신 direct DOM manipulation으로 0ms 반응성 구현
            sidebarRef.current.style.transform = `translate3d(0, ${scrollY}px, 0)`;
        };

        const handleWarp = () => {
            if (sidebarRef.current) {
                sidebarRef.current.classList.add('no-transition');
                sidebarRef.current.style.transform = `translate3d(0, 0, 0)`;
                setTimeout(() => {
                    sidebarRef.current?.classList.remove('no-transition');
                }, 50);
            }
        };

        window.addEventListener('scroll', updatePosition, { passive: true });
        window.addEventListener('sidebar-warp', handleWarp);
        updatePosition();

        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('sidebar-warp', handleWarp);
        };
    }, []);

    // 페이지 변경 시 상단 리셋
    useEffect(() => {
        if (sidebarRef.current) {
            sidebarRef.current.style.transform = `translate3d(0, 0, 0)`;
        }
    }, [pathname]);

    return (
        <>
            <div
                ref={sidebarRef}
                className={`flex flex-col gap-3 w-[160px] absolute transition-transform duration-300 ease-out will-change-transform z-20`}
                style={{ top: '16px' }}
            >
                {/* 상단 배지 (버튼 높이 정렬을 위해 마진 제거 및 핏 조정) */}
                <div className={`${badgeColor} text-white text-[10px] font-black py-1.5 rounded-t-xl text-center shadow-sm pointer-events-auto`}>
                    {side === 'left' ? 'BEST AD' : 'PREMIUM'}
                </div>

                <div className="flex flex-col gap-2.5 px-0.5">
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

                <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm pointer-events-auto text-center space-y-1 mx-0.5">
                    <p className="text-[9px] text-gray-500 font-bold">배너 광고 문의</p>
                    <p className="text-[13px] font-black text-gray-800 dark:text-gray-100 italic">1544-5568</p>
                </div>
            </div>

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
