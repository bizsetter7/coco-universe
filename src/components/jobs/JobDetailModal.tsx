'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageSquare, Phone, MapPin, Briefcase, User, Star, Siren, Info, Clock, Crown } from 'lucide-react';
import { Shop } from '@/types/shop';
import { formatKoreanMoney } from '@/utils/formatMoney';
import { getPayColor } from '@/utils/payColors';

interface JobDetailModalProps {
    shop: Shop | null;
    onClose: () => void;
    isFavorite?: boolean;
    onToggleFavorite?: (e: React.MouseEvent, id: string) => void;
}

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

const JobDetailModal: React.FC<JobDetailModalProps> = ({ shop, onClose, isFavorite, onToggleFavorite }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (shop) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [shop]);

    if (!shop || !mounted) return null;

    // Theme Helpers
    const isTiered = shop.tier && ['grand', 'premium', 'deluxe', 'special', 'urgent', 'recommended'].includes(shop.tier);
    // Header background is now always white/neutral based on user request for cleaner look, or we can keep gradient. 
    // User request: "상단 : 찜버튼... [지역]상세+업종(상세) 제목 아이콘+닉네임"
    // We will keep the gradient for tiered shops as it adds "Premium" feel requested in general guidelines.
    const headerBg = isTiered ? TIER_GRADIENTS[shop.tier!] : 'bg-white';
    const textColor = isTiered ? 'text-white' : 'text-gray-900';
    const subTextColor = isTiered ? 'text-white/80' : 'text-gray-500';
    const iconColor = isTiered ? 'text-white' : 'text-pink-500';

    // Option 8 Simulation (Emphasis Icon)
    // Logic: If shop has specific option OR random simulation for demo
    const hasEmphasis = shop.options?.icons?.includes('emphasis') || parseInt(shop.id.replace(/\D/g, '') || '0') % 8 === 0;

    // Keywords Simulation
    const keywords = shop.options?.keywords || ['초보가능', '경력우대', '당일지급', '숙식제공', '자유복장'];

    // Pay Option Simulation
    const payOption = shop.options?.paySuffixes?.[0] || '협의가능';

    const handleFavoriteClick = (e: React.MouseEvent) => {
        if (onToggleFavorite && shop.id) {
            onToggleFavorite(e, shop.id);
        }
    };

    return createPortal(
        <div
            className="modal-overlay fixed inset-0 z-[20000] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm touch-none overscroll-contain"
            onClick={onClose}
        >
            <div
                className="
                    bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col
                    fixed bottom-0 inset-x-0 w-full h-[95dvh] rounded-t-[32px] rounded-b-none
                    md:static md:w-[500px] lg:w-[600px] md:h-auto md:max-h-[90vh] md:rounded-[32px]
                    transform-gpu will-change-transform backface-hidden
                    animate-in slide-in-from-bottom duration-300 
                "
                onClick={e => e.stopPropagation()}
            >
                {/* 1. HEADER SECTION (Capture 2 Style) */}
                <div className={`p-6 md:p-8 relative text-center shrink-0 ${headerBg} transition-colors duration-300 flex flex-col items-center gap-4`}>

                    {/* Top Row: Ad No & Close Button */}
                    <div className="absolute top-5 right-6 flex items-center gap-2 z-50">
                        <span className={`text-[10px] font-mono font-black opacity-60 px-2 py-0.5 rounded-full bg-black/10 ${isTiered ? 'text-white/70' : 'text-gray-400'}`}>
                            No.{shop.adNo || '0000'}
                        </span>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
                            <X size={24} className={isTiered ? 'text-white' : 'text-gray-900'} />
                        </button>
                    </div>

                    {/* Star Button (Left) */}
                    <button
                        onClick={handleFavoriteClick}
                        className={`absolute top-5 left-6 p-2 rounded-full transition-all active:scale-95 z-50 ${isTiered ? 'bg-black/20 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-400 hover:text-amber-400 hover:bg-amber-50'}`}
                    >
                        <Star size={20} className={isFavorite ? "fill-amber-400 text-amber-400" : "hover:fill-current"} />
                    </button>

                    {/* Region & WorkType Badge */}
                    <div className={`bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[10px] font-black tracking-widest flex items-center gap-1.5 shadow-sm ${isTiered ? 'text-white' : 'text-gray-600 bg-gray-100/80 border-gray-200'}`}>
                        <MapPin size={10} /> {shop.region} | <Briefcase size={10} /> {shop.workType}
                    </div>

                    {/* Ad Title Single White Box Layout (Capture 2 Style) */}
                    <div className="w-full bg-white px-4 md:px-6 py-4 rounded-[24px] shadow-xl border border-white/50 flex flex-col md:flex-row items-center justify-center gap-3">
                        {/* Simulation of Icon if tiered or specific options */}
                        {(isTiered || hasEmphasis) && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 text-pink-600 rounded-xl border border-pink-100 shadow-sm shrink-0">
                                <span className="text-xl">{isTiered && shop.tier === 'grand' ? '👑' : '🔥'}</span>
                                <span className="text-[11px] font-black uppercase tracking-tight">{shop.tier === 'grand' ? 'GRAND' : 'HOT'}</span>
                            </div>
                        )}

                        <h2 className="text-xl md:text-2xl font-black leading-tight text-gray-900 flex-1 truncate text-center md:text-left">
                            {shop.title || shop.name}
                        </h2>
                    </div>

                    {/* Nickname Area */}
                    <div className="flex items-center gap-2.5 opacity-95 font-black text-sm bg-black/10 px-4 py-1.5 rounded-full text-white">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                            <User size={12} className="fill-current" />
                        </div>
                        {(shop.nickname || shop.name).replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, '').trim()}
                    </div>
                </div>

                {/* 2. BODY SECTION */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-8 bg-white dark:bg-gray-900">

                    {/* Pay & Option Section */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 dark:bg-gray-800 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <span className={`w-[24px] h-[24px] flex items-center justify-center rounded text-[10px] font-black text-white ${getPayColor(shop.payType || shop.pay)}`}>
                                {(shop.payType || shop.pay)?.includes('TC') ? 'T' : (shop.payType || shop.pay)?.substring(0, 1) || '시'}
                            </span>
                            <span className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight">
                                {formatKoreanMoney(shop.pay)}
                            </span>
                        </div>
                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-bold whitespace-nowrap">
                            <Clock size={14} className="text-pink-500" />
                            {payOption}
                        </div>
                    </div>

                    {/* 상세 모집내용 */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <span className="w-1 h-4 bg-pink-500 rounded-full"></span>
                            상세 모집내용
                        </h3>
                        <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 break-words whitespace-pre-wrap bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 min-h-[120px]">
                            {shop.description || `${shop.name}에서 열정적인 분을 모십니다.\n가족같은 분위기에서 함께 성장할 수 있습니다.\n\n[근무조건]\n- 근무기간: 1년이상\n- 근무요일: 요일협의\n- 근무시간: 시간협의\n\n초보자도 환영합니다!`}
                        </div>
                    </div>

                    {/* 위치 정보 (지도 RESTORED) */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                            위치 정보
                        </h3>
                        <div className="aspect-video rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 flex-col gap-2 border border-gray-50 dark:border-gray-700">
                            <MapPin size={32} className="opacity-50" />
                            <span className="text-xs font-bold">{shop.region}</span>
                            <span className="text-[10px] opacity-60">지도 보기 (준비중)</span>
                        </div>
                    </div>

                    {/* Keyword & Info (Subtle for SEO) */}
                    <div className="space-y-2 pt-2">
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1.5 opacity-80">
                            <Info size={12} />
                            Keyword & Info
                        </h3>
                        <div className="bg-gray-50/50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-100 dark:border-gray-800/50">
                            <div className="flex flex-wrap gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
                                {keywords.map((keyword, idx) => (
                                    <span key={idx} className="px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 text-[10px] font-medium">
                                        #{keyword}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. FOOTER SECTION (Contact) */}
                <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0 safe-area-bottom">
                    <div className="flex gap-3">
                        {/* Message Button */}
                        <button
                            onClick={() => {
                                // Dispatch Custom Event to Open Message Modal
                                const event = new CustomEvent('open-note-modal', {
                                    detail: { receiver: shop.managerName || shop.nickname || `${shop.name} 사장님` }
                                });
                                window.dispatchEvent(event);
                            }}
                            className="flex-1 flex flex-col items-center justify-center gap-1 bg-white border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition active:scale-[0.98]"
                        >
                            <MessageSquare size={20} className="stroke-current" />
                            <span className="text-xs font-black">쪽지문의</span>
                        </button>

                        {/* Kakao/Tele Button */}
                        {(shop.kakao || shop.telegram) && (
                            <button
                                onClick={() => {
                                    const id = shop.kakao || shop.telegram;
                                    navigator.clipboard.writeText(id);
                                    alert(`${shop.kakao ? '카카오톡' : '텔레그램'} ID가 복사되었습니다: ${id}`);
                                }}
                                className="flex-1 flex flex-col items-center justify-center gap-1 bg-yellow-400 text-yellow-900 py-3 rounded-xl hover:bg-yellow-500 transition active:scale-[0.98]"
                            >
                                <MessageSquare size={20} className="fill-yellow-900/20 stroke-current" />
                                <span className="text-xs font-black">{shop.kakao ? '카톡문의' : '텔레문의'}</span>
                            </button>
                        )}

                        {/* Phone Button */}
                        <a
                            href={`tel:${shop.phone}`}
                            className="flex-[2] flex flex-col items-center justify-center gap-1 bg-pink-600 text-white py-3 rounded-xl hover:bg-pink-700 transition active:scale-[0.98] shadow-lg shadow-pink-200 dark:shadow-none"
                        >
                            <Phone size={20} className="fill-white/20 stroke-current" />
                            <span className="text-xs font-black">전화/문자 지원하기</span>
                        </a>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default JobDetailModal;
