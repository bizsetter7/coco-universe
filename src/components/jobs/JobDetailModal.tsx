'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageSquare, Phone, MapPin, Briefcase, User, Star, Siren, Info, Clock, Crown, Globe } from 'lucide-react';
import { Shop } from '@/types/shop';
import { formatKoreanMoney } from '@/utils/formatMoney';
import { getPayColor } from '@/utils/payColors';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { cleanShopTitle, getIconById } from '@/utils/shopUtils';
import { IconBadge } from '@/components/common/IconBadge';
import { getHighlighterStyle } from '@/utils/highlighter';

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

export const JobDetailContent: React.FC<{ shop: Shop; isFavorite?: boolean; onToggleFavorite?: (e: React.MouseEvent, id: string) => void }> = ({ shop, isFavorite, onToggleFavorite }) => {
    // Keywords Simulation
    const keywords = shop.options?.keywords || ['초보가능', '경력우대', '당일지급', '숙식제공', '자유복장'];

    const handleFavoriteClick = (e: React.MouseEvent) => {
        if (onToggleFavorite && shop.id) {
            onToggleFavorite(e, shop.id);
        }
    };

    const isTiered = shop.tier && ['grand', 'premium', 'deluxe', 'special', 'urgent', 'recommended'].includes(shop.tier);
    const headerBg = isTiered ? TIER_GRADIENTS[shop.tier!] : 'bg-white';

    return (
        <div className="flex flex-col h-full bg-white">
            {/* 1. HEADER SECTION */}
            <div className={`p-6 md:p-8 relative text-center shrink-0 ${headerBg} transition-colors duration-300 flex flex-col items-center gap-4`}>
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

                {/* Ad Title White Box Layout */}
                <div className="w-full bg-white px-4 md:px-6 py-5 rounded-[24px] shadow-xl border border-white/50 flex flex-col items-center justify-center gap-3">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <IconBadge iconId={shop.options?.icon} showName={true} />
                        <h2 className="text-sm font-black leading-tight text-gray-900 truncate text-center">
                            <span style={getHighlighterStyle(shop.options?.highlighter)}>
                                {cleanShopTitle(shop.title, shop.name)}
                            </span>
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 opacity-95 font-black text-sm bg-black/10 px-4 py-1.5 rounded-full text-white">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <User size={12} className="fill-current" />
                    </div>
                    {cleanShopTitle(undefined, shop.nickname || shop.name)}
                </div>
            </div>

            {/* 2. BODY SECTION */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-8 !bg-white relative" style={{ backgroundColor: '#ffffff', isolation: 'isolate', mixBlendMode: 'normal' }}>
                <div className="absolute top-2 right-4 text-[9px] font-mono font-bold text-gray-300 z-10">
                    No.{shop.adNo || shop.id?.substring(0, 4) || '1004'}
                </div>

                {/* Pay & Keywords Box */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch group hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 pr-4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 shrink-0">
                        <div className={`w-9 h-9 flex items-center justify-center rounded-xl text-md font-black shadow-inner shrink-0 text-white ${getPayColor(shop.payType || shop.pay)}`}>
                            {(shop.payType || shop.pay)?.substring(0, 1) || '시'}
                        </div>
                        <div className="flex flex-col gap-0.5 overflow-hidden">
                            <div className="text-[18px] md:text-[22px] font-black text-gray-800 tracking-tighter leading-tight flex items-baseline gap-1">
                                {formatKoreanMoney(shop.pay)}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 md:pl-6 grid grid-cols-3 gap-1.5 py-4 md:py-0">
                        {keywords.slice(0, 6).map((kw, idx) => (
                            <span key={idx} className="px-1 py-1.5 bg-pink-50 text-pink-500 text-[10px] font-black rounded-lg border border-pink-100/50 flex items-center justify-center text-center leading-tight shadow-sm">
                                {kw}
                            </span>
                        ))}
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
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                            <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                            위치 정보
                        </h3>
                    </div>
                    <div className="relative aspect-video rounded-3xl overflow-hidden border border-gray-100 shadow-inner group">
                        <img
                            src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff4444(${shop.lng || 126.9780},${shop.lat || 37.5665})/${shop.lng || 126.9780},${shop.lat || 37.5665},15,0/600x400?access_token=pk.eyJ1IjoibW9ja3VzaGVyIiwiYSI6ImNrNzh6Zzh6ejAwMXAzZHBkbmR6Zzh6ejAifQ`}
                            alt="Map"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-lg flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[12px] font-black text-gray-900">{shop.region} 상세위치</span>
                                <span className="text-[10px] font-bold text-gray-500">정확한 주소는 지원 시 확인 가능합니다.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Footer */}
                <div className="p-4 bg-white border-t border-gray-100 shrink-0 safe-area-bottom">
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                const event = new CustomEvent('open-note-modal', {
                                    detail: { receiver: shop.managerName || shop.nickname || `${shop.name} 사장님` }
                                });
                                window.dispatchEvent(event);
                            }}
                            className="flex-1 flex flex-col items-center justify-center gap-1 bg-white border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition active:scale-[0.98]"
                        >
                            <MessageSquare size={20} />
                            <span className="text-xs font-black">쪽지문의</span>
                        </button>
                        <a
                            href={`tel:${shop.phone}`}
                            className="flex-[2] flex flex-col items-center justify-center gap-1 bg-pink-600 text-white py-3 rounded-xl hover:bg-pink-700 transition active:scale-[0.98] shadow-lg shadow-pink-200"
                        >
                            <Phone size={20} />
                            <span className="text-xs font-black">전화/문자 지원하기</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const JobDetailModal: React.FC<JobDetailModalProps> = ({ shop, onClose, isFavorite, onToggleFavorite }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useBodyScrollLock(!!shop);

    if (!shop || !mounted) return null;

    const isTiered = shop.tier && ['grand', 'premium', 'deluxe', 'special', 'urgent', 'recommended'].includes(shop.tier);

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
                <div className="absolute top-5 right-6 flex items-center gap-2 z-[20005]">
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
                        <X size={24} className={isTiered ? 'text-white' : 'text-gray-900'} />
                    </button>
                </div>
                <JobDetailContent shop={shop} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
            </div>
        </div>,
        document.body
    );
};

export default JobDetailModal;
