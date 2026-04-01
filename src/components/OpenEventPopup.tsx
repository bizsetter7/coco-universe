'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Megaphone, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

export default function OpenEventPopup() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // 전역 스크롤 관리자 연동
    useBodyScrollLock(isOpen);

    useEffect(() => {
        setMounted(true);

        // 오늘 하루 보지 않기 여부 체크
        const lastClose = localStorage.getItem('coco_open_event_hide');
        const today = new Date().toDateString();

        if (lastClose !== today) {
            setIsOpen(true);
        }
    }, []);

    const closePopup = (hideForToday: boolean) => {
        setIsOpen(false);
        if (hideForToday) {
            localStorage.setItem('coco_open_event_hide', new Date().toDateString());
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-5"
            onClick={() => closePopup(false)}
        >
            <div
                className="relative w-full max-w-[380px] bg-white rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative Top Gradient */}
                <div className="h-3 w-full bg-gradient-to-r from-[#f82b60] to-[#ff6b95]"></div>

                {/* Close X Button (Top Right) */}
                <button
                    onClick={() => closePopup(false)}
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <X size={20} className="text-gray-500" />
                </button>

                <div className="p-8 pb-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f82b60]/10 text-[#f82b60] font-black text-xs mb-6">
                        <Megaphone size={14} /> 오픈기념 상생지원 이벤트
                    </div>

                    <h2 className="text-[28px] font-black leading-[1.2] tracking-tighter text-gray-900 mb-6">
                        사장님 주목! 🙌<br />
                        <span className="text-[#f82b60]">파격 혜택</span> 드립니다
                    </h2>

                    {/* Event Blocks */}
                    <div className="space-y-4 mb-8 text-left">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 font-bold text-2xl">
                                💎
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">EVENT 01</p>
                                <p className="text-[15px] font-black text-gray-800 leading-tight">
                                    지역별 <span className="text-[#f82b60]">선착순 10곳</span><br />
                                    베이직 무료 광고 게시!
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 font-bold text-2xl">
                                🎁
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">EVENT 02</p>
                                <p className="text-[15px] font-black text-gray-800 leading-tight">
                                    모든 광고 등록 시<br />
                                    <span className="text-[#f82b60]">추가 1개월 무료(1+1)</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={() => {
                            router.push('/my-shop?view=form&new=true');
                            closePopup(false);
                        }}
                        className="group w-full py-5 bg-[#f82b60] hover:bg-[#db2456] text-white font-black text-lg rounded-[20px] shadow-xl shadow-[#f82b60]/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        무료 공고 등록하기 <ArrowRight size={20} />
                    </button>
                    
                    <p className="mt-4 text-[13px] font-bold text-gray-400">
                        * 사업자 인증 완료 회원 한정 적용
                    </p>
                </div>

                {/* Mobile-Friendly Control Bar */}
                <div className="flex border-t border-gray-100 bg-[#fcfcfc]">
                    <button
                        onClick={() => closePopup(true)}
                        className="flex-1 py-5 text-[13px] font-black text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-100"
                    >
                        오늘 하루 보지 않기
                    </button>
                    <button
                        onClick={() => closePopup(false)}
                        className="flex-1 py-5 text-[13px] font-black text-[#f82b60] hover:bg-gray-50 transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
