'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageSquare, Phone, MapPin, Briefcase, User, Star, Info, Clock, Crown } from 'lucide-react';
import { formatKoreanMoney } from '@/utils/formatMoney';
import { getPayColor } from '@/utils/payColors';
import { ICONS, HIGHLIGHTERS } from '../constants';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

const TIER_GRADIENTS: Record<string, string> = {
    grand: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    premium: 'bg-gradient-to-r from-purple-600 to-pink-500',
    deluxe: 'bg-gradient-to-r from-blue-500 to-cyan-400',
    special: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    urgent: 'bg-gradient-to-r from-rose-500 to-orange-400',
    recommended: 'bg-gradient-to-r from-indigo-500 to-violet-400',
    native: 'bg-gray-100',
    common: 'bg-gray-50'
};

const PAY_TYPE_BADGES: Record<string, string> = {
    '시급': 'bg-red-100 text-red-600',
    '일급': 'bg-blue-100 text-blue-600',
    '주급': 'bg-green-100 text-green-600',
    '월급': 'bg-purple-100 text-purple-600',
    '건별': 'bg-gray-100 text-gray-600',
};

export const AdDetailModal = ({ ad, onClose, brand }: { ad: any, onClose: () => void, brand: any }) => {
    const [mounted, setMounted] = useState(false);

    useBodyScrollLock(!!ad);

    useEffect(() => {
        console.log("AdDetailModal MOUNTED with ad:", ad);
        setMounted(true);
    }, [ad]);

    if (!mounted || !ad) return null;
    if (typeof document === 'undefined') return null;

    // Normalizing ad data to match standard Shop interface features
    const tier = ad.productType === '그랜드' || ad.productType === 'p1' ? 'grand' :
        ad.productType === '프리미엄' || ad.productType === 'p2' ? 'premium' : 'grand'; // Default to grand for preview if unknown

    const isTiered = true; // Always treated as tiered in this modal context
    const headerBg = TIER_GRADIENTS[tier] || TIER_GRADIENTS['grand'];

    // Keywords Simulation
    const keywords = ad.keywords || [];

    // Pay Option Simulation
    const payOption = ad.options?.paySuffixes?.[0] || '협의가능';

    return createPortal(
        <div
            className="modal-overlay fixed inset-0 z-[20000] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm touch-none overscroll-contain animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="
                    bg-white shadow-2xl overflow-hidden flex flex-col
                    fixed bottom-0 inset-x-0 w-full h-[95dvh] rounded-t-[32px] rounded-b-none
                    md:static md:w-[500px] lg:w-[600px] md:h-auto md:max-h-[90vh] md:rounded-[32px]
                    transform-gpu will-change-transform backface-hidden
                    animate-in slide-in-from-bottom duration-300 
                "
                onClick={e => e.stopPropagation()}
            >
                {/* 1. HEADER SECTION (Matches JobDetailModal / Capture 1) */}
                <div className={`p-6 md:p-8 relative text-center shrink-0 ${headerBg} transition-colors duration-300 flex flex-col items-center gap-4`}>

                    {ad.id === 'preview' && (
                        <div className="absolute top-0 left-0 right-0 bg-red-600/20 text-white text-[10px] font-black text-center py-1 z-50 backdrop-blur-sm">
                            PREVIEW MODE
                        </div>
                    )}

                    {/* Top Row: Close Button Only (Simplified for AdDetail) */}
                    <div className="absolute top-5 right-6 flex items-center gap-2 z-50">
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
                            <X size={24} className="text-white" />
                        </button>
                    </div>

                    {/* Star Button (Left) - Visual Only */}
                    <button className="absolute top-5 left-6 p-2 rounded-full transition-all bg-black/20 text-white hover:bg-white/20 z-50">
                        <Star size={20} className="hover:fill-current" />
                    </button>

                    {/* Region & WorkType Badge */}
                    <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[10px] font-black tracking-widest flex items-center gap-1.5 shadow-sm text-white">
                        <MapPin size={10} /> {ad.regionCity} {ad.regionGu} | <Briefcase size={10} /> {ad.category || '업종'}
                    </div>

                    {/* Ad Title White Box Layout (CENTERED) */}
                    <div className="w-full bg-white px-4 md:px-6 py-5 rounded-[24px] shadow-xl border border-white/50 flex flex-col items-center justify-center gap-3">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {ad.options?.icon && (() => {
                                const iconObj = ICONS.find((i: any) => i.id === Number(ad.options.icon));
                                return iconObj ? (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-pink-50 text-pink-600 rounded-xl border border-pink-100 shadow-sm shrink-0">
                                        <span className="text-lg">{iconObj.icon}</span>
                                        <span className="text-[10px] font-black uppercase tracking-tight">{iconObj.name}</span>
                                    </div>
                                ) : null;
                            })()}

                            <h2 className="text-xl md:text-2xl font-black leading-tight text-gray-900 truncate text-center">
                                <span
                                    style={ad.options?.highlighter ? {
                                        backgroundColor: HIGHLIGHTERS.find((h: any) => h.id === Number(ad.options.highlighter))?.color + 'cc',
                                        color: '#000',
                                        padding: '2px 8px',
                                        borderRadius: '6px'
                                    } : {}}
                                >
                                    {(ad.title || ad.jobTitle || '').replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, '').trim()}
                                </span>
                            </h2>
                        </div>
                    </div>

                    {/* Nickname Area */}
                    <div className="flex items-center gap-2.5 opacity-95 font-black text-sm bg-black/10 px-4 py-1.5 rounded-full text-white">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                            <User size={12} className="fill-current" />
                        </div>
                        {(ad.nickname || ad.shopName || '관리자').replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, '').trim()}
                    </div>
                </div>

                {/* 2. BODY SECTION */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-8 bg-white relative" style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
                    {/* Ad Number (Moved to Body) */}
                    <div className="absolute top-2 right-4 text-[9px] font-mono font-bold text-gray-300 z-10">
                        No.{ad.adNo || ad.id?.toString().substring(0, 4) || '1004'}
                    </div>

                    {/* Pay & Keywords Box (CENTERED/GRID) */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch group hover:shadow-md transition-shadow">
                        {/* Left: Salary Info */}
                        <div className="flex items-center gap-3 pr-4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 shrink-0">
                            {/* Stylish Square Box Badge */}
                            <div className={`w-9 h-9 flex items-center justify-center rounded-xl text-md font-black shadow-inner shrink-0 text-white ${getPayColor(ad.payType || (ad.adNo ? '시급' : ''))}`}>
                                {(ad.payType || '').includes('TC') ? 'T' : (ad.payType || '')?.substring(0, 1) || '급'}
                            </div>
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                <div className="text-[18px] md:text-[22px] font-black text-gray-800 tracking-tighter leading-tight flex items-baseline gap-1">
                                    {formatKoreanMoney(ad.payAmount)}
                                </div>
                            </div>
                        </div>

                        {/* Right: Keywords (Grid 3 cols) */}
                        <div className="flex-1 md:pl-6 grid grid-cols-3 gap-1.5 py-4 md:py-0">
                            {(ad.options?.paySuffixes || []).slice(0, 6).map((kw: string, idx: number) => (
                                <span key={idx} className="px-1 py-1.5 bg-pink-50 text-pink-500 text-[10px] font-black rounded-lg border border-pink-100/50 flex items-center justify-center text-center leading-tight shadow-sm">
                                    {kw}
                                </span>
                            ))}
                            {(ad.options?.paySuffixes || []).length === 0 && (
                                <span className="col-span-3 text-gray-300 text-[11px] font-bold italic py-2">등록된 키워드 없음</span>
                            )}
                        </div>
                    </div>

                    {/* 상세 모집내용 */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                            <span className="w-1 h-4 bg-pink-500 rounded-full"></span>
                            상세 모집내용
                        </h3>
                        {/* Using dangeroulsySetHtml for editor content compatibility */}
                        <div
                            className="prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed bg-white p-4 rounded-xl border border-gray-100 min-h-[120px]"
                            dangerouslySetInnerHTML={{ __html: ad.content || '등록된 상세 내용이 없습니다.' }}
                        />
                    </div>

                    {/* 위치 정보 */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                            <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                            위치 정보
                        </h3>
                        <div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 flex-col gap-2 border border-gray-50">
                            <MapPin size={32} className="opacity-50" />
                            <span className="text-xs font-bold">{ad.regionCity} {ad.regionGu}</span>
                            <span className="text-[10px] opacity-60">지도 보기 (준비중)</span>
                        </div>
                    </div>

                    {/* [Restored] Keyword & Info */}
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-1.5">
                            <Info size={16} />
                            Keyword & Info
                        </h3>

                        {/* Keywords Grid Only (Subtle Style) */}
                        {keywords && keywords.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {keywords.map((k: string, i: number) => (
                                    <span key={i} className="text-[10px] font-normal text-gray-400 bg-gray-50/50 px-2 py-1 rounded border border-gray-100">
                                        #{k}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="h-8 bg-gray-50/30 rounded border border-gray-100/30"></div>
                        )}
                    </div>

                </div>

                {/* 3. FOOTER SECTION (Contact) */}
                <div className="p-4 bg-white border-t border-gray-100 shrink-0 safe-area-bottom">
                    <div className="flex gap-3">
                        <button className="flex-1 flex flex-col items-center justify-center gap-1 bg-white border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition active:scale-[0.98]">
                            <MessageSquare size={20} className="stroke-current" />
                            <span className="text-xs font-black">쪽지문의</span>
                        </button>
                        <button className="flex-1 flex flex-col items-center justify-center gap-1 bg-yellow-400 text-yellow-900 py-3 rounded-xl hover:bg-yellow-500 transition active:scale-[0.98]">
                            <MessageSquare size={20} className="fill-yellow-900/20 stroke-current" />
                            <span className="text-xs font-black">카톡문의</span>
                        </button>
                        <button className="flex-[2] flex flex-col items-center justify-center gap-1 bg-pink-600 text-white py-3 rounded-xl hover:bg-pink-700 transition active:scale-[0.98] shadow-lg shadow-pink-200">
                            <Phone size={20} className="fill-white/20 stroke-current" />
                            <span className="text-xs font-black">전화/문자 지원하기</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
