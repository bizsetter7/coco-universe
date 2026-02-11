'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageSquare, Phone, MapPin, Briefcase, User, Star, Info, Clock, Crown } from 'lucide-react';
import { formatKoreanMoney } from '@/utils/formatMoney';
import { getPayColor } from '@/utils/payColors';

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

                    {/* Ad Title Single White Box Layout */}
                    <div className="w-full bg-white px-4 md:px-6 py-4 rounded-[24px] shadow-xl border border-white/50 flex flex-col md:flex-row items-center justify-center gap-3">
                        {/* Tier Icon */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 text-pink-600 rounded-xl border border-pink-100 shadow-sm shrink-0">
                            <span className="text-xl">{tier === 'grand' ? '👑' : '🔥'}</span>
                            <span className="text-[11px] font-black uppercase tracking-tight">{tier === 'grand' ? 'GRAND' : 'HOT'}</span>
                        </div>

                        <h2 className="text-xl md:text-2xl font-black leading-tight text-gray-900 flex-1 truncate text-center md:text-left">
                            <span className="md:hidden">
                                {(ad.title || ad.jobTitle || '').replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, '').trim().length > 15
                                    ? (ad.title || ad.jobTitle || '').replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, '').trim().slice(0, 15) + '...'
                                    : (ad.title || ad.jobTitle || '').replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, '').trim()}
                            </span>
                            <span className="hidden md:block">
                                {(ad.title || ad.jobTitle || '').replace(/\[.*?\]|\(.*?\]|\{.*?\}/g, '').trim()}
                            </span>
                        </h2>
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
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-8 bg-white">

                    {/* Pay & Option Section */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 gap-3 md:gap-0">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <span className={`w-[24px] h-[24px] flex items-center justify-center rounded text-[10px] font-black text-white ${getPayColor(ad.payType || (ad.adNo ? '시급' : ''))}`}>
                                {(ad.payType || '').includes('TC') ? 'T' : (ad.payType || '')?.substring(0, 1) || '협'}
                            </span>
                            <span className="text-lg font-black text-gray-900 tracking-tight">
                                {formatKoreanMoney(ad.payAmount)}
                            </span>
                        </div>

                        <div className="hidden md:block h-8 w-px bg-gray-200 mx-2"></div>

                        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                            {(ad.options?.paySuffixes || []).length > 0 ? (
                                (ad.options.paySuffixes).map((suffix: string, idx: number) => (
                                    <span key={idx} className="bg-pink-50 text-pink-600 px-2 py-1 rounded text-[10px] font-bold border border-pink-100 whitespace-nowrap">
                                        {suffix}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400 text-xs font-bold">옵션 없음</span>
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

                    {/* Keyword & Info */}
                    <div className="space-y-2 pt-2">
                        <h3 className="text-xs font-bold text-gray-400 flex items-center gap-1.5 opacity-80">
                            <Info size={12} />
                            Keyword & Info
                        </h3>
                        <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                            <div className="flex flex-wrap gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
                                {keywords.map((keyword: string, idx: number) => (
                                    <span key={idx} className="px-2 py-1 rounded bg-white border border-gray-200 text-gray-400 text-[10px] font-medium">
                                        #{keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
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
