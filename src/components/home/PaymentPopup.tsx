'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBrand } from '@/components/BrandProvider';
import { X, CheckCircle2, Info, Gift, ExternalLink } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface PaymentPopupProps {
    isOpen: boolean;
    onClose: () => void;
    initialTier?: string;
}

interface Package {
    id: number;
    tier: string;
    name: string;
    desc: React.ReactNode;
    price: string;
    originalPrice?: string;
    isEvent?: boolean;
}

const PACKAGES: Package[] = [
    {
        id: 0,
        tier: 'event_basic',
        name: '오픈기념 무료 베이직',
        desc: (
            <>
                최신 구인정보 리스트<br />
                <span className="text-red-500 font-black">선착순 10개 업소 한정!</span>
            </>
        ),
        price: '0원',
        originalPrice: '60,000원',
        isEvent: true,
    },
    {
        id: 1,
        tier: 'grand',
        name: '타입1. 그랜드 (Grand)',
        desc: (
            <>
                메인 최상단 노출 및<br />
                압도적 광고 효과
            </>
        ),
        price: '350,000원'
    },
    {
        id: 2,
        tier: 'premium',
        name: '타입2. 프리미엄 (Premium)',
        desc: (
            <>
                상단 시선 집중<br />
                높은 효율성 노출
            </>
        ),
        price: '200,000원'
    },
    {
        id: 3,
        tier: 'deluxe',
        name: '타입3. 디럭스 (Deluxe)',
        desc: (
            <>
                타겟 지역 집중<br />
                전략적 배너 노출
            </>
        ),
        price: '150,000원'
    },
    {
        id: 4,
        tier: 'special',
        name: '타입4. 스페셜 (Special)',
        desc: (
            <>
                가성비 최우선<br />
                실속형 배너 노출
            </>
        ),
        price: '120,000원'
    },
    {
        id: 5,
        tier: 'urgent',
        name: '타입5. 급구/추천 (Urgent)',
        desc: (
            <>
                급구/추천 배지 노출로<br />
                주목도 실속형
            </>
        ),
        price: '100,000원'
    },
    {
        id: 6,
        tier: 'native',
        name: '타입6. 네이티브 (Native)',
        desc: (
            <>
                리스트 광고에 배치<br />
                랜덤 상단노출효과
            </>
        ),
        price: '80,000원'
    },
    {
        id: 7,
        tier: 'basic',
        name: '타입7. 베이직/줄광고',
        desc: (
            <>
                최신 구인정보 리스트<br />
                (실속형 구인 상품)
            </>
        ),
        price: '60,000원'
    },
    {
        id: 8,
        tier: 'extract',
        name: '기타-강조옵션 (Emphasis)',
        desc: (
            <>
                아이콘/형광펜<br />
                테두리/급여추가<br />
                (주목도 200% 상승)
            </>
        ),
        price: '30,000원'
    },
];

export const PaymentPopup: React.FC<PaymentPopupProps> = ({ isOpen, onClose, initialTier = 'event_basic' }) => {
    const brand = useBrand();
    const [selectedTier, setSelectedTier] = useState(initialTier);
    const [mounted, setMounted] = useState(false);

    // 전역 스크롤 관리자 연동
    useBodyScrollLock(isOpen);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // SSR 환경에서 document.body 접근 에러 방지 및 컴포넌트 마운트 확인
    if (!mounted || !isOpen) return null;

    const handleApply = () => {
        window.open('https://yasajang.kr', '_blank', 'noopener,noreferrer');
        onClose();
    };

    const primaryBgStyle = { backgroundColor: brand.primaryColor };

    return createPortal(
        <div
            className="modal-overlay fixed inset-0 z-[20000] flex items-center justify-center bg-black/80 backdrop-blur-sm touch-none overscroll-contain"
            onClick={onClose}
        >
            <div
                className={`
                    w-full max-w-2xl rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden relative flex flex-col 
                    fixed bottom-0 md:static
                    max-h-[85dvh] md:max-h-[90vh]
                    ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
                    transform-gpu animate-in slide-in-from-bottom duration-300
                `}
                onClick={e => e.stopPropagation()}
            >

                {/* Header - Centered as per user request */}
                <div className={`p-6 border-b text-center relative shrink-0 ${brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div>
                        <h2 className={`text-xl md:text-2xl font-black tracking-tighter ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>사장님 전용 상품 안내</h2>
                        <p className="text-xs md:text-sm text-gray-400 mt-2 font-bold">원하시는 광고 상품을 선택해주세요.</p>
                    </div>
                    <button onClick={onClose} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-black/5 rounded-full transition-colors">
                        <X size={24} className={brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 overflow-y-auto flex-1 touch-pan-y overscroll-contain">
                    {/* 야사장 안내 배너 */}
                    <div className="bg-indigo-50 text-indigo-700 text-xs md:text-sm p-3 rounded-xl mb-4 border border-indigo-200 flex items-start gap-2">
                        <Info size={16} className="shrink-0 mt-0.5" />
                        <p className="leading-tight break-keep">
                            <span className="font-bold">광고 신청은 야사장에서 진행됩니다.</span><br />
                            아래 상품을 확인하신 후 야사장 사이트에서 간편하게 신청하세요.
                        </p>
                    </div>

                    {/* 이벤트 배너 */}
                    <div className="bg-red-50 text-red-600 text-center leading-relaxed p-4 rounded-xl mb-6 font-bold flex flex-col items-center justify-center gap-1 shadow-inner border border-red-100">
                        <div className="flex items-center gap-1.5 text-sm md:text-base">
                            <span className="animate-bounce">🎉</span>
                            <span>한정 이벤트 · 선착순 100업소</span>
                        </div>
                        <span className="block text-lg md:text-xl font-black text-red-600 tracking-tight">1개월 결제 시 1개월 추가 무료!</span>
                    </div>

                    <div className="space-y-3">
                        {PACKAGES.map((pkg) => (
                            <label
                                key={pkg.id}
                                className={`block p-4 border rounded-xl cursor-pointer relative overflow-hidden transition-all
                                    ${pkg.isEvent
                                        ? (selectedTier === pkg.tier
                                            ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/20'
                                            : 'border-emerald-300 bg-emerald-50/10 hover:border-emerald-400')
                                        : (selectedTier === pkg.tier
                                            ? 'border-red-500 ring-1 ring-red-500 bg-red-50/10'
                                            : (brand.theme === 'dark' ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-white hover:border-gray-300'))
                                    }
                                `}
                                onClick={() => setSelectedTier(pkg.tier)}
                            >
                                {/* 이벤트 상품 뱃지 */}
                                {pkg.isEvent && (
                                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] px-2 py-0.5 font-bold uppercase tracking-tighter flex items-center gap-0.5">
                                        <Gift size={9} />FREE
                                    </div>
                                )}
                                {/* 기존 이벤트 뱃지 (id===1 → grand) */}
                                {pkg.id === 1 && <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] px-2 py-0.5 font-bold uppercase tracking-tighter">Event</div>}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedTier === pkg.tier ? (pkg.isEvent ? 'border-emerald-500' : 'border-red-500') : 'border-gray-300'}`}>
                                            {selectedTier === pkg.tier && <div className={`w-2.5 h-2.5 rounded-full ${pkg.isEvent ? 'bg-emerald-500' : 'bg-red-500'}`} />}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <span className={`block font-black text-sm md:text-base mb-1 ${pkg.isEvent ? 'text-emerald-700' : (brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-900')}`}>{pkg.name}</span>
                                            <span className="text-[12px] md:text-[13px] text-gray-500 font-medium block leading-snug break-keep">
                                                {pkg.desc}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 whitespace-nowrap">
                                        {pkg.isEvent ? (
                                            <div className="flex flex-col items-end gap-0.5">
                                                <span className="text-[11px] text-gray-400 font-bold line-through">{pkg.originalPrice}</span>
                                                <span className="text-base md:text-lg font-black text-emerald-600">{pkg.price}</span>
                                            </div>
                                        ) : (
                                            <span className={`text-base md:text-lg font-black ${brand.theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{pkg.price}</span>
                                        )}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className={`p-4 border-t shrink-0 ${brand.theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}>
                    <button
                        style={primaryBgStyle}
                        className="w-full text-white font-bold py-4 rounded-xl text-lg shadow-md hover:opacity-90 transition active:scale-[0.99] flex items-center justify-center gap-2"
                        onClick={handleApply}
                    >
                        <ExternalLink size={20} />
                        야사장에서 광고 신청하기
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
