'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BrandConfig } from '@/lib/brand-config';

export default function EventPopup({ brand }: { brand: BrandConfig }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if popup should be hidden for today
        const hideDate = localStorage.getItem('hideEventPopupdate');
        const today = new Date().toDateString();

        if (hideDate !== today) {
            setIsOpen(true);
        }
    }, []);

    const closePopup = (hideForToday: boolean) => {
        setIsOpen(false);
        if (hideForToday) {
            localStorage.setItem('hideEventPopupdate', new Date().toDateString());
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="relative w-[90%] max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl">
                {/* Top Bar for Brand Color */}
                <div className="h-2 w-full" style={{ backgroundColor: brand.primaryColor }}></div>

                {/* Close Button */}
                <button
                    onClick={() => closePopup(false)}
                    className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-colors"
                >
                    <X size={20} className="text-gray-600" />
                </button>

                <div className="p-6 text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-600 font-bold text-xs mb-4">
                        🚀 GRAND OPEN EVENT
                    </span>
                    <h2 className="text-2xl font-black mb-2 text-gray-800">
                        사장님, <span style={{ color: brand.primaryColor }}>광고비 0원</span><br />
                        지금 바로 시작하세요!
                    </h2>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                        오픈 기념! 최초 가입 시<br />
                        <strong className="text-gray-800">프리미엄 광고 3개월 무료</strong> 혜택을 드립니다.<br />
                        (선착순 100업소 한정)
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                router.push('/my-shop'); // 즉각적인 탭 전환
                                closePopup(false);
                            }}
                            style={{ backgroundColor: brand.primaryColor }}
                            className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:opacity-90 transition-all active:scale-95"
                        >
                            무료 혜택 받기
                        </button>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="flex bg-gray-100 border-t border-gray-200">
                    <button
                        onClick={() => closePopup(true)}
                        className="flex-1 py-3 text-xs text-gray-500 font-bold hover:bg-gray-200 transition-colors border-r border-gray-200"
                    >
                        오늘 하루 보지 않기
                    </button>
                    <button
                        onClick={() => closePopup(false)}
                        className="flex-1 py-3 text-xs text-gray-500 font-bold hover:bg-gray-200 transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
