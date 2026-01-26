'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBrand } from './BrandProvider';
import { useSearchParams, usePathname } from 'next/navigation';
import { X, PhoneCall } from 'lucide-react';

interface BannerSidebarProps {
    side: 'left' | 'right';
}

/**
 * BannerSidebar - 'Global Zero-Lag Tracking' 전용 버젼 (궁극의 완성본)
 * - 사용자님이 원하시는 '내 가게 관리'의 부드러움을 전역으로 확장
 * - 상향 이동(리셋)은 '물리적 0ms', 하향 이동만 '프리미엄 Chasing'
 * - 커뮤니티 탭 전환 등 모든 내부 뷰 변화에 즉각 대응
 */
export const BannerSidebar = ({ side }: BannerSidebarProps) => {
    const brand = useBrand();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [selectedAd, setSelectedAd] = useState<any>(null);
    const asideRef = useRef<HTMLElement>(null);
    const lastScrollY = useRef(0);
    const isLocked = useRef(false);

    // 1. 초강력 위치 리셋 함수 (Force Snap)
    const snapToTop = () => {
        const aside = asideRef.current;
        if (!aside) return;

        isLocked.current = true;
        aside.style.transition = 'none'; // 애니메이션 씨를 말림
        aside.style.transform = `translate3d(0, 0, 0)`; // 0px로 즉시 텔레포트
        lastScrollY.current = 0;

        // 브라우저 렌더링 동기화 후 하향 추적 모드만 다시 켬
        setTimeout(() => {
            isLocked.current = false;
        }, 100);
    };

    // 2. 전역 변화 감지 (URL, Params, Custom Event)
    useEffect(() => {
        snapToTop();
        window.addEventListener('sidebar-warp', snapToTop);
        return () => window.removeEventListener('sidebar-warp', snapToTop);
    }, [pathname, searchParams]);

    // 3. 지능형 방향성 스크롤 엔진
    useEffect(() => {
        const handleScroll = () => {
            if (isLocked.current) return;

            const aside = asideRef.current;
            if (!aside) return;

            const currentScroll = Math.max(0, window.scrollY);

            // [방향 기반 애니메이션 정책]
            // - 위로 올라가거나 최상단(0) 근처면 -> 0ms (즉시 정지)
            // - 아래로 내려가면 -> 500ms (부드러운 추적)
            if (currentScroll < lastScrollY.current || currentScroll < 10) {
                aside.style.transition = 'none';
                aside.style.transform = `translate3d(0, ${currentScroll}px, 0)`;
                if (currentScroll === 0) lastScrollY.current = 0;
            } else {
                aside.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)';
                aside.style.transform = `translate3d(0, ${currentScroll}px, 0)`;
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

    const badgeColor = side === 'left' ? 'bg-[#5B5FFF]' : 'bg-[#E91E63]';

    return (
        <>
            <aside
                ref={asideRef}
                className={`flex absolute ${side === 'left' ? 'left-0' : 'right-0'} w-[160px] flex-col gap-3 z-10 will-change-transform`}
                style={{
                    top: '26px',
                    transform: 'translate3d(0, 0, 0)'
                }}
            >
                <div className={`${badgeColor} text-white text-[10px] font-black py-1.5 rounded-t-xl text-center shadow-sm pointer-events-auto`}>
                    {side === 'left' ? 'BEST AD' : 'PREMIUM'}
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
