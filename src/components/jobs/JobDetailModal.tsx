'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, MapPin, Briefcase, Info, MessageSquare, Phone, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Shop } from '@/types/shop';
import { formatKoreanMoney } from '@/utils/formatMoney';
import { getHighlighterStyle } from '@/utils/highlighter';
import { cleanShopTitle, generateSEOKeywords } from '@/utils/shopUtils';
import { ICONS } from '@/constants/job-options';
import { useBrand } from '@/components/BrandProvider';
import { AD_TIER_STANDARDS } from '@/constants/standards';
import { getPayColor, getPayAbbreviation } from '@/utils/payColors';

interface JobDetailModalProps {
    shop: Shop;
    onClose: () => void;
    isFavorite: boolean;
    onToggleFavorite: (e: React.MouseEvent) => void;
}

// [Optimization] Detached Content for SEO & Portal usage
interface JobDetailContentProps {
    shop: Shop;
    publisherAddress?: string | null;
    onClose: () => void;
    isFavorite: boolean;
    onToggleFavorite: (e: React.MouseEvent) => void;
}

export const JobDetailContent = ({ shop, publisherAddress, onClose, isFavorite, onToggleFavorite }: JobDetailContentProps) => {
    // CENTRALIZED THEME LOGIC
    const productType = shop.productType || shop.tier || 'p7';
    const pt = String(productType).toLowerCase();
    // 'urgent'는 AD_TIER_STANDARDS altId에 없으므로 선처리 (2026-03-22)
    const isUrgentTier = pt.includes('urgent');
    const tierStandard = isUrgentTier
        ? { id: 'urgent' }
        : (AD_TIER_STANDARDS.find(s => pt.includes(s.id) || pt.includes(s.altId)) || AD_TIER_STANDARDS[6]);

    // v2.0 — AD_TIER_STANDARDS 동기화 + 배지 흰색 통일 (2026-03-22)
    const getHeaderTheme = (tid: string) => {
        switch (tid) {
            case 'p1':     return { bg: "from-amber-500 to-amber-600",     accent: "text-amber-500",   badge: "bg-white/20" }; // Grand
            case 'p2':     return { bg: "from-red-600 to-red-700",         accent: "text-red-600",     badge: "bg-white/20" }; // Premium
            case 'p3':     return { bg: "from-blue-600 to-blue-700",       accent: "text-blue-600",    badge: "bg-white/20" }; // Deluxe
            case 'p4':     return { bg: "from-emerald-600 to-emerald-700", accent: "text-emerald-600", badge: "bg-white/20" }; // Special
            case 'p5':     return { bg: "from-purple-600 to-purple-700",   accent: "text-purple-500",  badge: "bg-white/20" }; // Urgent/Recommended 🟣
            case 'p6':     return { bg: "from-slate-600 to-slate-700",     accent: "text-slate-500",   badge: "bg-white/20" }; // Native
            case 'urgent': return { bg: "from-purple-600 to-purple-700",   accent: "text-purple-500",  badge: "bg-white/20" }; // Urgent 🟣
            default:       return { bg: "from-stone-700 to-stone-800",     accent: "text-stone-400",   badge: "bg-white/20" }; // Basic
        }
    };

    const themeConfig = getHeaderTheme(tierStandard.id);
    const headerBg = themeConfig.bg;

    const borderOpt = shop.options?.border || (shop as any).borderOption;
    const getBorderClass = (opt: string) => {
        switch (opt) {
            case 'color': return 'border-4 border-blue-500';
            case 'glow': return 'border-4 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]';
            case 'sparkle': return 'border-4 border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.6)] animate-pulse';
            case 'rainbow': return 'animate-rainbow-border shadow-2xl';
            default: return '';
        }
    };

    return (
        <div
            className={`
                bg-white shadow-2xl overflow-hidden flex flex-col
                fixed bottom-0 inset-x-0 w-full h-[95dvh] rounded-t-[32px] rounded-b-none
                md:static md:w-[500px] lg:w-[600px] md:h-auto md:max-h-[90vh] md:rounded-[32px]
                transform-gpu will-change-transform backface-hidden 
                ${getBorderClass(borderOpt)}
            `}
            onClick={e => e.stopPropagation()}
        >
            {/* 1. HEADER SECTION */}
            <div className={`relative px-6 py-6 md:py-8 bg-gradient-to-br ${headerBg} text-white flex flex-col items-center text-center gap-4 shrink-0 shadow-lg`}>

                {/* [Mod Moved] Close Button (Inside Header) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-all z-20 backdrop-blur-sm"
                    aria-label="닫기"
                >
                    <X size={20} />
                </button>

                {/* [Mod Moved] Favorite Button (Inside Header) */}
                <button
                    onClick={onToggleFavorite}
                    className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-all z-20 backdrop-blur-sm group"
                    aria-label="찜하기"
                >
                    <Star size={20} className={isFavorite ? "fill-yellow-400 text-yellow-400" : "text-white group-hover:scale-110 transition-transform"} />
                </button>

                {/* Region | Industry Badge */}
                <div className="bg-black/40 px-3 py-1 rounded-full border border-white/20 text-[10px] font-black tracking-widest flex items-center gap-1.5 shadow-sm text-white mt-2">
                    <MapPin size={10} /> {shop.region} | <Briefcase size={10} /> {shop.category || shop.workType || '업종미기재'}
                </div>

                {/* Ad Title White Box Layout (CENTERED) */}
                <div className="w-full bg-white px-4 md:px-6 py-5 rounded-[24px] shadow-xl border border-white/50 flex flex-col items-center justify-center gap-3">
                    <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                        {/* Icon Logic */}
                        {(shop.options?.icon) && (() => {
                            const iconId = Number(shop.options.icon);
                            const iconObj = ICONS.find((i) => i.id === iconId);
                            return iconObj ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-sm shrink-0">
                                    <span className="text-lg">{iconObj.icon}</span>
                                    <span className="text-[10px] font-black uppercase tracking-tight">{iconObj.name}</span>
                                </div>
                            ) : null;
                        })()}

                        {/* Title Logic */}
                        <h2 className="text-[15px] md:text-[16px] font-black leading-tight text-gray-900 truncate text-center break-keep">
                            <span style={getHighlighterStyle(shop.options?.highlighter)}>
                                {cleanShopTitle(shop.title, shop.name)}
                            </span>
                        </h2>
                    </div>
                </div>

                {/* Nickname Badge */}
                <div className="flex items-center gap-2 opacity-95 font-black text-[13px] md:text-sm bg-black/10 px-4 py-1.5 rounded-full">
                    {cleanShopTitle(undefined, shop.nickname || shop.name)}
                </div>
            </div>

            {/* 2. BODY SECTION */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-gray-50/30 relative">
                {/* Ad No */}
                <div className="absolute top-2 right-4 text-[10px] font-mono font-bold text-gray-400 select-all z-10">
                    No.{shop.adNo || shop.id?.substring(0, 4) || '1004'}
                </div>

                {/* Pay & Keywords Box */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch group hover:shadow-md transition-shadow">
                    {/* Left: Salary Info */}
                    <div className="flex items-center gap-3 pr-4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 shrink-0">
                        <div className={`w-9 h-9 flex items-center justify-center rounded-xl text-md font-black shadow-inner shrink-0 text-white ${getPayColor(shop.payType || shop.pay)}`}>
                            {getPayAbbreviation(shop.payType || shop.pay)}
                        </div>
                        <div className="flex flex-col gap-0.5 overflow-hidden">
                            <div className="text-[18px] md:text-[22px] font-black text-gray-800 tracking-tighter leading-tight flex items-baseline gap-1">
                                {formatKoreanMoney(shop.pay)}
                            </div>
                        </div>
                    </div>

                    {/* Right: Keywords */}
                    <div className="flex-1 md:pl-6 grid grid-cols-3 gap-1.5 py-4 md:py-0">
                        {(shop.options?.paySuffixes || []).slice(0, 6).map((kw: string, i: number) => (
                            <span key={i} className="px-1 py-1.5 bg-blue-50 text-blue-500 text-[10px] font-black rounded-lg border border-blue-100/50 flex items-center justify-center text-center leading-tight shadow-sm">
                                {kw}
                            </span>
                        ))}
                        {(!shop.options?.paySuffixes || shop.options.paySuffixes.length === 0) && (
                            <span className="col-span-3 text-gray-300 text-[11px] font-bold italic py-2">등록된 급여 옵션 없음</span>
                        )}
                    </div>
                </div>

                {/* 상세 모집내용 */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                        <h3 className="text-[17px] font-black text-gray-800">상세 모집내용</h3>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[150px]">
                        <div
                            className="prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed break-words prose-img:rounded-2xl prose-img:shadow-sm"
                            dangerouslySetInnerHTML={{ __html: shop.description || `<p>${shop.name}에서 열정적인 분을 모십니다!</p>` }}
                        />
                    </div>
                </div>

                {/* 위치 정보 */}
                <div className="space-y-3">
                    <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                        <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                        위치 정보
                    </h3>
                    <div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 flex-col gap-2 border border-gray-50 overflow-hidden relative">
                        <img
                            src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff4444(${shop.lng || 126.9780},${shop.lat || 37.5665})/${shop.lng || 126.9780},${shop.lat || 37.5665},15,0/600x300?access_token=pk.eyJ1IjoibW9ja3VzaGVyIiwiYSI6ImNrNzh6Zzh6ejAwMXAzZHBkbmR6Zzh6ejAifQ`}
                            alt="Map"
                            className="absolute inset-0 w-full h-full object-cover grayscale-[20%]"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm p-3 border-t border-gray-100 flex items-center gap-3">
                            <MapPin size={24} className="text-gray-400" />
                            <div>
                                <div className="text-[12px] font-black text-gray-900">사업자 등록 주소</div>
                                <div className="text-[11px] text-gray-500 font-medium">
                                    {publisherAddress || shop.businessAddress || shop.region || '주소 정보 없음'}
                                </div>
                            </div>
                        </div>
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
                            {(() => {
                                const autoKeywords = generateSEOKeywords(shop.region);
                                const userKeywords = shop.options?.keywords || [];
                                const allKeywords = Array.from(new Set([...userKeywords, ...autoKeywords]));

                                if (allKeywords.length > 0) {
                                    return allKeywords.map((kw: any, i: number) => (
                                        <span key={i} className="px-2 py-1 rounded bg-white border border-gray-200 text-gray-400 text-[10px] font-medium">
                                            #{kw}
                                        </span>
                                    ));
                                } else {
                                    return <span className="text-gray-300 text-[11px] font-bold">등록된 키워드가 없습니다.</span>;
                                }
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. FOOTER SECTION */}
            <div className="p-6 bg-white border-t border-gray-100 grid grid-cols-4 gap-3 shrink-0 safe-area-bottom">
                <button
                    onClick={() => {
                        const event = new CustomEvent('open-note-modal', {
                            detail: { receiver: shop.managerName || shop.nickname || `${shop.name} 사장님` }
                        });
                        window.dispatchEvent(event);
                    }}
                    className="col-span-1 py-4 bg-gray-50 border border-gray-100 text-gray-600 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition shadow-sm group"
                >
                    <MessageSquare size={20} className="mb-0.5 text-gray-400" />
                    <span className="text-[10px] font-black">쪽지문의</span>
                </button>
                <button
                    onClick={() => {
                        const messengerId = shop.kakao || shop.telegram;
                        if (messengerId) {
                            navigator.clipboard.writeText(messengerId);
                            alert(`${shop.kakao ? '카카오톡' : '텔레그램'} ID가 복사되었습니다: ${messengerId}`);
                        } else {
                            alert('등록된 메신저 ID가 없습니다.');
                        }
                    }}
                    className="col-span-1 py-4 bg-amber-400 text-black rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-amber-500 transition shadow-sm font-black group"
                >
                    <MessageCircle size={20} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px]">카톡문의</span>
                </button>
                <a
                    href={`tel:${shop.phone}`}
                    className="col-span-2 py-4 bg-[#f82b60] text-white rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-[#db2456] transition shadow-lg shadow-[#f82b60]/30 group"
                >
                    <div className="flex items-center gap-2">
                        <Phone size={18} fill="currentColor" className="group-hover:animate-bounce" />
                        <span className="text-[15px] font-black">전화/문자 지원하기</span>
                    </div>
                </a>
            </div>
        </div>
    );
};

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ shop, onClose, isFavorite, onToggleFavorite }) => {
    const [mounted, setMounted] = useState(false);
    const [publisherAddress, setPublisherAddress] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfileAddress = async () => {
            if (!shop) return;
            const targetId = shop.user_id || shop.ownerId;
            if (!targetId) return;
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('address, address_detail')
                    .eq('id', targetId)
                    .single();
                if (data) {
                    const fullAddr = `${data.address || ''} ${data.address_detail || ''}`.trim();
                    if (fullAddr) setPublisherAddress(fullAddr);
                }
            } catch (err) {
                console.warn('Failed to fetch publisher address:', err);
            }
        };
        fetchProfileAddress();
    }, [shop]);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div
            className="modal-overlay fixed inset-0 z-[99999] flex items-end md:items-center justify-center bg-black/90 md:bg-black/80 backdrop-blur-sm touch-none overscroll-contain"
            onClick={onClose}
        >
            <div className="relative w-full h-full flex items-center justify-center cursor-pointer" onClick={onClose}>
                {/* [Mod] Buttons moved inside Content */}
                <JobDetailContent
                    shop={shop}
                    publisherAddress={publisherAddress}
                    onClose={onClose}
                    isFavorite={isFavorite}
                    onToggleFavorite={onToggleFavorite}
                />
            </div>
        </div>,
        document.body
    );
};

export default JobDetailModal;
