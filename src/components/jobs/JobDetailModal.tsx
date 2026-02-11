'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageSquare, Phone, MapPin, Briefcase, User, Star, Siren, Info, Clock, Crown } from 'lucide-react';
import { Shop } from '@/types/shop';
import { formatKoreanMoney } from '@/utils/formatMoney';
import { getPayColor } from '@/utils/payColors';
import { HIGHLIGHTERS, ICONS } from '@/constants/job-options';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

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

    useBodyScrollLock(!!shop);

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
                    bg-white shadow-2xl overflow-hidden flex flex-col
                    fixed bottom-0 inset-x-0 w-full h-[95dvh] rounded-t-[32px] rounded-b-none
                    md:static md:w-[500px] lg:w-[600px] md:h-auto md:max-h-[90vh] md:rounded-[32px]
                    transform-gpu will-change-transform backface-hidden
                    animate-in slide-in-from-bottom duration-300 
                "
                onClick={e => e.stopPropagation()}
            >
                {/* 1. HEADER SECTION (Capture 2 Style) */}
                <div className={`p-6 md:p-8 relative text-center shrink-0 ${headerBg} transition-colors duration-300 flex flex-col items-center gap-4`}>

                    {/* Top Row: Close Button Only */}
                    <div className="absolute top-5 right-6 flex items-center gap-2 z-50">
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
                            <X size={24} className={isTiered ? 'text-white' : 'text-gray-900'} />
                        </button>
                    </div>

                    {/* Star Button (Left) */}
                    <button
                        onClick={handleFavoriteClick}
                        className={`absolute top-5 left-6 p-2 rounded-full transition-all active:scale-95 z-50 ${isTiered ? 'bg-black/20 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-400 hover:text-amber-400 hover:bg-amber-50'}`}
                    >
                        <Star size={20} className={isFavorite ? "fill-white text-white" : "hover:fill-current"} />
                    </button>

                    {/* Region & WorkType Badge */}
                    <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[10px] font-black tracking-widest flex items-center gap-1.5 shadow-sm text-white">
                        <MapPin size={10} /> {shop.region} | <Briefcase size={10} /> {shop.workType}
                    </div>

                    {/* Ad Title White Box Layout (RE-RESTORED & CENTERED) */}
                    <div className="w-full bg-white px-4 md:px-6 py-5 rounded-[24px] shadow-xl border border-white/50 flex flex-col items-center justify-center gap-3">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {shop.options?.icon && (() => {
                                const iconObj = ICONS.find(i => i.id === Number(shop.options?.icon));
                                return iconObj ? (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-pink-50 text-pink-600 rounded-xl border border-pink-100 shadow-sm shrink-0">
                                        <span className="text-lg">{iconObj.icon}</span>
                                        <span className="text-[10px] font-black uppercase tracking-tight">{iconObj.name}</span>
                                    </div>
                                ) : null;
                            })()}

                            <h2 className="text-xl md:text-2xl font-black leading-tight text-gray-900 truncate text-center">
                                <span
                                    style={shop.options?.highlighter ? {
                                        backgroundColor: HIGHLIGHTERS.find(h => h.id === Number(shop.options?.highlighter))?.color + 'cc',
                                        color: '#000',
                                        padding: '2px 8px',
                                        borderRadius: '6px'
                                    } : {}}
                                    className="md:hidden"
                                >
                                    {(shop.title || shop.name).replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, '').trim().length > 15
                                        ? (shop.title || shop.name).replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, '').trim().slice(0, 15) + '...'
                                        : (shop.title || shop.name).replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, '').trim()}
                                </span>
                                <span
                                    style={shop.options?.highlighter ? {
                                        backgroundColor: HIGHLIGHTERS.find(h => h.id === Number(shop.options?.highlighter))?.color + 'cc',
                                        color: '#000',
                                        padding: '2px 10px',
                                        borderRadius: '6px'
                                    } : {}}
                                    className="hidden md:inline"
                                >
                                    {shop.title || shop.name}
                                </span>
                            </h2>
                        </div>
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
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-8 !bg-white relative" style={{ backgroundColor: '#ffffff', isolation: 'isolate', mixBlendMode: 'normal' }}>
                    {/* Ad Number (Moved to Body for minimal visual impact) */}
                    <div className="absolute top-2 right-4 text-[9px] font-mono font-bold text-gray-300 z-10">
                        No.{shop.adNo || shop.id?.substring(0, 4) || '1004'}
                    </div>

                    {/* Pay & Keywords Box (Redesigned as per user capture) */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch group hover:shadow-md transition-shadow">
                        {/* Left: Salary Info */}
                        <div className="flex items-center gap-3 pr-4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 shrink-0">
                            {/* Stylish Square Box Badge */}
                            <div className={`w-9 h-9 flex items-center justify-center rounded-xl text-md font-black shadow-inner shrink-0 text-white ${getPayColor(shop.payType || shop.pay)}`}>
                                {(shop.payType || shop.pay)?.substring(0, 1) || '시'}
                            </div>
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                <div className="text-[18px] md:text-[22px] font-black text-gray-800 tracking-tighter leading-tight flex items-baseline gap-1">
                                    {formatKoreanMoney(shop.pay)}
                                </div>
                            </div>
                        </div>

                        {/* Right: Keywords (Grid 3 cols) */}
                        <div className="flex-1 md:pl-6 grid grid-cols-3 gap-1.5 py-4 md:py-0">
                            {keywords.slice(0, 6).map((kw, idx) => (
                                <span key={idx} className="px-1 py-1.5 bg-pink-50 text-pink-500 text-[10px] font-black rounded-lg border border-pink-100/50 flex items-center justify-center text-center leading-tight shadow-sm">
                                    {kw}
                                </span>
                            ))}
                            {keywords.length === 0 && (
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
                        <div className="text-sm leading-relaxed text-gray-600 break-words whitespace-pre-wrap bg-white p-4 rounded-xl border border-gray-100 min-h-[120px]">
                            {shop.description || `${shop.name}에서 열정적인 분을 모십니다.\n가족같은 분위기에서 함께 성장할 수 있습니다.\n\n[근무조건]\n- 근무기간: 1년이상\n- 근무요일: 요일협의\n- 근무시간: 시간협의\n\n초보자도 환영합니다!`}
                        </div>
                    </div>

                    {/* 위치 정보 */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                            <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                            위치 정보
                        </h3>
                        <div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 flex-col gap-2 border border-gray-50">
                            <MapPin size={32} className="opacity-50" />
                            <span className="text-xs font-bold">{shop.region}</span>
                            <span className="text-[10px] opacity-60">지도 보기 (준비중)</span>
                        </div>
                    </div>

                    {/* [Added] Keyword & Info (Matches AdDetailModal style) */}
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-1.5">
                            <Info size={16} />
                            Keyword & Info
                        </h3>

                        {/* Keywords Grid Only */}
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
                            className="flex-[2] flex flex-col items-center justify-center gap-1 bg-pink-600 text-white py-3 rounded-xl hover:bg-pink-700 transition active:scale-[0.98] shadow-lg shadow-pink-200"
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
