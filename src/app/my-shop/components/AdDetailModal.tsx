'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageSquare, Phone, MapPin, Briefcase, User, Star, Info } from 'lucide-react';
import { formatKoreanMoney } from '@/utils/formatMoney';
// getPayColor is now imported from @/utils/payColors
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { getHighlighterStyle } from '@/utils/highlighter';
import { cleanShopTitle } from '@/utils/shopUtils';
import { IconBadge } from '@/components/common/IconBadge';
import { getPayColor, getPayAbbreviation } from '@/utils/payColors';

// v2.0 — AD_TIER_STANDARDS 동기화 (2026-03-22)
const TIER_GRADIENTS: Record<string, string> = {
    grand:       'bg-amber-500',   // 🟡 황금 (#F59E0B)
    premium:     'bg-red-600',     // 🔴 레드 (#DC2626)
    deluxe:      'bg-blue-600',    // 🔵 블루 (#2563EB)
    special:     'bg-emerald-600', // 🟢 에메랄드 (#059669)
    urgent:      'bg-purple-600',  // 🟣 보라 (급구/추천)
    recommended: 'bg-purple-600',  // 🟣 보라 (급구/추천)
    native:      'bg-slate-600',   // ⬛ 슬레이트 (#475569)
    common:      'bg-stone-700'    // 🪨 스톤 다크 (#44403C)
};



export const AdDetailModal = ({ ad, onClose }: { ad: any, onClose: () => void }) => {
    const [mounted, setMounted] = useState(false);

    useBodyScrollLock(!!ad);

    useEffect(() => {

        setMounted(true);
    }, [ad]);

    if (!mounted || !ad) return null;
    if (typeof document === 'undefined') return null;

    const formatPayAmount = (type: string, amount: number | string) => {
        if (type === '협' || type === '급여협의' || !amount || amount === '0' || amount === 0) return '급여협의';
        const cleanAmount = typeof amount === 'string' ? parseInt(amount.replace(/,/g, '')) : amount;
        return `${cleanAmount.toLocaleString()}원`;
    };

    // [Robust Normalization] Ensure all UI fields are populated from DB columns or Options
    const norm = {
        title: ad.title || ad.options?.title,
        nickname: ad.nickname || ad.options?.nickname || '닉네임',
        regionCity: ad.regionCity || ad.region || ad.options?.regionCity || '',
        regionGu: ad.regionGu || ad.work_region_sub || ad.options?.regionGu || '',
        category: ad.category || ad.options?.category || '',
        categorySub: ad.categorySub || ad.category_sub || ad.options?.categorySub || '',

        // Pay Info
        payType: ad.payType || ad.pay_type || ad.options?.payType || '협의',
        payAmount: ad.payAmount || ad.pay_amount || ad.options?.payAmount || 0,
        paySuffixes: ad.paySuffixes || ad.options?.pay_suffixes || ad.options?.paySuffixes || [],

        // Options
        selectedIcon: ad.selectedIcon || ad.options?.icon || ad.options?.selectedIcon,
        selectedHighlighter: ad.selectedHighlighter || ad.options?.highlighter || ad.options?.selectedHighlighter,

        // Contact
        managerPhone: ad.managerPhone || ad.manager_phone || ad.options?.managerPhone,
        messengers: ad.messengers || ad.options?.messengers || {},

        // Content
        content: ad.content || ad.options?.content,
        adNo: ad.adNo || ad.id?.toString().substring(0, 4) || '1004'
    };

    const productType = ad.productType || ad.tier || ad.options?.product_type || 'p7';
    const tier =
        productType === '그랜드' || productType === 'p1' ? 'grand' :
            productType === '프리미엄' || productType === 'p2' ? 'premium' :
                productType === '디럭스' || productType === 'p3' ? 'deluxe' :
                    productType === '스페셜' || productType === 'p4' ? 'special' :
                        productType === '급구/추천' || productType === 'p5' ? 'urgent' :
                            productType === '네이티브' || productType === 'p6' ? 'native' :
                                productType === '일반' || productType === 'p7' ? 'common' : 'common';
    const headerBg = TIER_GRADIENTS[tier] || TIER_GRADIENTS['common'];

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
                {/* 1. HEADER SECTION */}
                <div className={`p-5 md:p-8 relative text-center shrink-0 ${headerBg} transition-colors duration-300 flex flex-col items-center gap-3 md:gap-4`}>
                    <div className="absolute top-5 right-6 flex items-center gap-2 z-50">
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
                            <X size={24} className="text-white" />
                        </button>
                    </div>

                    <button className="absolute top-5 left-6 p-2 rounded-full transition-all bg-black/20 text-white hover:bg-white/20 z-50">
                        <Star size={20} className="hover:fill-current" />
                    </button>

                    <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[10px] font-black tracking-widest flex items-center gap-1.5 shadow-sm text-white">
                        <MapPin size={10} /> {norm.regionCity} {norm.regionGu} | <Briefcase size={10} /> {norm.category} | {norm.categorySub}
                    </div>

                    <div className="w-full bg-white px-4 md:px-6 py-5 rounded-[24px] shadow-xl border border-white/50 flex flex-col items-center justify-center gap-2 md:gap-3">
                        <div className="flex items-center justify-center gap-2 md:gap-3">
                            <IconBadge iconId={norm.selectedIcon} showName={true} />
                            <h2 className="text-[13px] md:text-sm font-black leading-tight text-gray-900 line-clamp-2 text-center break-all">
                                <span style={getHighlighterStyle(norm.selectedHighlighter)}>
                                    {norm.title}
                                </span>
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 opacity-95 font-black text-sm bg-black/10 px-4 py-1.5 rounded-full text-white">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                            <User size={12} className="fill-current" />
                        </div>
                        {norm.nickname}
                    </div>
                </div>

                {/* 2. BODY SECTION */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden pt-6 px-6 pb-2 space-y-8 bg-white relative" style={{ backgroundColor: '#ffffff', isolation: 'isolate' }}>
                    {/* Ad Number (Moved to Body) */}
                    <div className="absolute top-2 right-4 text-[9px] font-mono font-bold text-gray-300 z-10">
                        No.{norm.adNo}
                    </div>

                    {/* Pay & Keywords Box (CENTERED/GRID) */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch group hover:shadow-md transition-shadow">
                        {/* Left: Salary Info */}
                        <div className="flex items-center gap-3 pr-4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 shrink-0">
                            {/* Stylish Square Box Badge */}
                            <div className={`w-9 h-9 flex items-center justify-center rounded-xl text-md font-black shadow-inner shrink-0 text-white ${getPayColor(norm.payType)}`}>
                                {getPayAbbreviation(norm.payType)}
                            </div>
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                <div className="text-[18px] md:text-[22px] font-black text-gray-800 tracking-tighter leading-tight flex items-baseline gap-1">
                                    {norm.payType === '협의' || norm.payType === '급여협의' || (norm.payAmount || 0) === 0 ? '급여협의' : formatKoreanMoney(norm.payAmount)}
                                </div>
                            </div>
                        </div>

                        {/* Right: Keywords (Grid 3 cols) */}
                        <div className="flex-1 md:pl-6 grid grid-cols-3 gap-1.5 py-4 md:py-0">
                            {norm.paySuffixes.slice(0, 6).map((kw: string, idx: number) => (
                                <span key={idx} className="px-1 py-1.5 bg-blue-50 text-blue-500 text-[10px] font-black rounded-lg border border-blue-100/50 flex items-center justify-center text-center leading-tight shadow-sm">
                                    {kw}
                                </span>
                            ))}
                            {norm.paySuffixes.length === 0 && (
                                <span className="col-span-3 text-gray-300 text-[11px] font-bold italic py-2">등록된 급여 옵션 없음</span>
                            )}
                        </div>
                    </div>

                    {/* 상세 모집내용 */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                            상세 모집내용
                        </h3>
                        {/* Using dangeroulsySetHtml for editor content compatibility */}
                        <div
                            className="prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed bg-white p-4 rounded-xl border border-gray-100 min-h-[120px]"
                            dangerouslySetInnerHTML={{ __html: norm.content || '등록된 상세 내용이 없습니다.' }}
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
                            <span className="text-xs font-bold">{norm.regionCity} {norm.regionGu}</span>
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
                        {(ad.keywords || ad.options?.keywords || []).length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {(ad.keywords || ad.options?.keywords || []).map((k: string, i: number) => (
                                    <span key={i} className="text-[10px] font-normal text-gray-400 bg-gray-50/50 px-2 py-1 rounded border border-gray-100">
                                        #{k}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="h-8 bg-gray-50/30 rounded border border-gray-100/30 flex items-center justify-center text-[10px] text-gray-300">등록된 키워드 없음</div>
                        )}
                    </div>

                    {/* Scroll Margin for Safe Area */}
                    <div className="h-2"></div>
                </div>

                {/* 3. FOOTER SECTION (Contact) */}
                <div className="p-4 bg-white border-t border-gray-100 shrink-0 safe-area-bottom">
                    <div className="flex gap-3">
                        <button
                            onClick={() => alert(`쪽지 기능을 준비 중입니다. (${norm.nickname || '사장님'}께)`)}
                            className="flex-1 flex flex-col items-center justify-center gap-1 bg-white border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition active:scale-[0.98]"
                        >
                            <MessageSquare size={20} className="stroke-current" />
                            <span className="text-xs font-black">쪽지문의</span>
                        </button>
                        <button
                            onClick={() => {
                                const kakao = norm.messengers?.kakao;
                                if (kakao) {
                                    window.open(`https://qr.kakao.com/talk/${kakao}`, '_blank');
                                } else {
                                    alert('등록된 카카오톡 ID가 없습니다.');
                                }
                            }}
                            className="flex-1 flex flex-col items-center justify-center gap-1 bg-yellow-400 text-yellow-900 py-3 rounded-xl hover:bg-yellow-500 transition active:scale-[0.98]"
                        >
                            <MessageSquare size={20} className="fill-yellow-900/20 stroke-current" />
                            <span className="text-xs font-black">카톡문의</span>
                        </button>
                        <button
                            onClick={() => {
                                const phone = norm.managerPhone;
                                if (phone) {
                                    window.location.href = `tel:${phone}`;
                                } else {
                                    alert('등록된 연락처가 없습니다.');
                                }
                            }}
                            className="flex-[2] flex flex-col items-center justify-center gap-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition active:scale-[0.98] shadow-lg shadow-blue-200"
                        >
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
