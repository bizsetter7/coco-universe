'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBrand } from '@/components/BrandProvider';
import { X, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PaymentPopupProps {
    isOpen: boolean;
    onClose: () => void;
    initialTier?: string;
}

const PACKAGES = [
    {
        id: 1,
        tier: 'grand',
        name: '1번 - 그랜드 (Grand)',
        desc: (
            <>
                메인/지역 최상단 0순위 독점 노출<br />
                <span className="text-amber-600 dark:text-amber-400 font-extrabold animate-pulse">(Glow 효과 포함)</span>
            </>
        ),
        price: '350,000원'
    },
    {
        id: 2,
        tier: 'premium',
        name: '2번 - 프리미엄 (Premium)',
        desc: (
            <>
                메인 상단 전략적 고정<br />
                <span className="text-violet-600 dark:text-violet-400 font-bold">(보라색 보더 적용)</span>
            </>
        ),
        price: '200,000원'
    },
    {
        id: 3,
        tier: 'deluxe',
        name: '3번 - 디럭스 (Deluxe)',
        desc: (
            <>
                메인 중앙 집중 노출<br />
                <span className="text-blue-600 dark:text-blue-400 font-bold">(블루 보더 적용)</span>
            </>
        ),
        price: '150,000원'
    },
    {
        id: 4,
        tier: 'special',
        name: '4번 - 스페셜 (Special)',
        desc: (
            <>
                리스트 상단 핑크 보더 노출<br />
                <span className="text-pink-600 dark:text-pink-400 font-bold">(관심 집중)</span>
            </>
        ),
        price: '120,000원'
    },
    {
        id: 5,
        tier: 'urgent',
        name: '5번 - 급구/추천 (Urgent)',
        desc: (
            <>
                빨간 제목 + 추천 배지<br />
                <span className="text-red-600 dark:text-red-400 font-bold">(가독성 극대화)</span>
            </>
        ),
        price: '100,000원'
    },
    {
        id: 6,
        tier: 'native',
        name: '6번 - 네이티브 (Native)',
        desc: '일반 리스트 노출 (네이티브 스타일)',
        price: '80,000원'
    },
    {
        id: 7,
        tier: 'basic',
        name: '7번 - 베이직/줄광고',
        desc: '일반 리스트 노출 (실속형 구인 상품)',
        price: '60,000원'
    },
    {
        id: 8,
        tier: 'extract',
        name: '8번 - 강조옵션 (Emphasis)',
        desc: (
            <>
                아이콘/형광펜 효과<br />
                <span className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 px-1 rounded font-black">(주목도 200% 상승)</span>
            </>
        ),
        price: '30,000원'
    },
];

export const PaymentPopup: React.FC<PaymentPopupProps> = ({ isOpen, onClose, initialTier = 'grand' }) => {
    const brand = useBrand();
    const router = useRouter();
    const [selectedTier, setSelectedTier] = useState(initialTier);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen && initialTier) {
            setSelectedTier(initialTier);
        }
    }, [isOpen, initialTier]);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
            // Prevent scroll chain and layout shift
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }
        } else {
            document.body.classList.remove('modal-open');
            document.body.style.paddingRight = '';
        }
        return () => {
            document.body.classList.remove('modal-open');
            document.body.style.paddingRight = '';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const handleApply = () => {
        // Mock Login Check
        const isLoggedIn = localStorage.getItem('user_session') || localStorage.getItem('isLoggedIn');

        if (!isLoggedIn) {
            if (confirm('광고를 신청하려면 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?')) {
                router.push('/?page=login');
            }
            return;
        }

        router.push(`/my-shop?view=form&tier=${selectedTier}`);
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
                    transform-gpu will-change-transform backface-hidden
                    animate-in slide-in-from-bottom duration-300 md:animate-in md:fade-in md:zoom-in
                `}
                onClick={e => e.stopPropagation()}
            >

                {/* Header - Centered as per user request */}
                <div className={`p-6 border-b text-center relative shrink-0 ${brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div>
                        <h2 className={`text-xl md:text-2xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>사장님 전용 상품 안내</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-2">원하시는 광고 상품을 선택해주세요.</p>
                    </div>
                    <button onClick={onClose} className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-black/5 rounded-full transition-colors">
                        <X size={24} className={brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 overflow-y-auto flex-1 touch-pan-y overscroll-contain">
                    {/* [UPDATE] 2-Line Banner */}
                    <div className="bg-red-50 text-red-600 text-center leading-relaxed p-4 rounded-xl mb-6 font-bold flex flex-col items-center justify-center gap-1 shadow-inner border border-red-100">
                        <div className="flex items-center gap-1.5 text-sm md:text-base">
                            <span className="animate-bounce">🎉</span>
                            <span>오픈 기념 선착순 100업소</span>
                        </div>
                        <span className="block text-lg md:text-xl font-black text-red-600 tracking-tight">3개월 무료 체험 진행 중!</span>
                    </div>

                    <div className="space-y-3">
                        {PACKAGES.map((pkg) => (
                            <label
                                key={pkg.id}
                                className={`block p-4 border rounded-xl cursor-pointer relative overflow-hidden transition-all 
                                    ${selectedTier === pkg.tier
                                        ? 'border-red-500 ring-1 ring-red-500 bg-red-50/10'
                                        : (brand.theme === 'dark' ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-white hover:border-gray-300')
                                    }
                                `}
                                onClick={() => setSelectedTier(pkg.tier)}
                            >
                                {pkg.id === 1 && <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] px-2 py-0.5 font-bold uppercase tracking-tighter">Event</div>}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedTier === pkg.tier ? 'border-red-500' : 'border-gray-300'}`}>
                                            {selectedTier === pkg.tier && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <span className={`block font-black text-sm md:text-base mb-1 ${brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{pkg.name}</span>
                                            {/* [UPDATE] Rich Text Description */}
                                            <span className="text-[12px] md:text-[13px] text-gray-500 font-medium block leading-snug break-keep">
                                                {pkg.desc}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 whitespace-nowrap">
                                        {pkg.id === 1 && <span className="block text-gray-400 line-through text-[10px] mb-[-2px]">350,000원</span>}
                                        <span className={`text-base md:text-lg font-black ${pkg.id === 1 ? 'text-red-500' : (brand.theme === 'dark' ? 'text-gray-200' : 'text-gray-800')}`}>{pkg.id === 1 ? '0원' : pkg.price}</span>
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
                        <CheckCircle2 size={20} />
                        선택한 상품 신청하기
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
