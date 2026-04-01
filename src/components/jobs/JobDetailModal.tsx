'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, MapPin, Briefcase, Info, MessageSquare, Phone, MessageCircle, Flag, ClipboardList, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { Shop } from '@/types/shop';
import { formatKoreanMoney } from '@/utils/formatMoney';
import { getHighlighterStyle } from '@/utils/highlighter';
import { cleanShopTitle, generateSEOKeywords } from '@/utils/shopUtils';
import { ICONS } from '@/constants/job-options';
import { useBrand } from '@/components/BrandProvider';
import { AD_TIER_STANDARDS } from '@/constants/standards';
import { getPayColor, getPayAbbreviation } from '@/utils/payColors';
import { ReportAdModal } from '@/components/common/ReportAdModal';
import { useAuth } from '@/hooks/useAuth';

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
    onClose?: () => void;
    isFavorite?: boolean;
    onToggleFavorite?: (e: React.MouseEvent) => void;
}

export const JobDetailContent = ({
    shop, publisherAddress,
    onClose = () => window.history.back(),
    isFavorite = false,
    onToggleFavorite = () => {},
}: JobDetailContentProps) => {
    const [showReport, setShowReport] = useState(false);
    const { user, userType, isLoggedIn } = useAuth();
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [applyName, setApplyName] = useState('');
    const [applyPhone, setApplyPhone] = useState('');
    const [applyMsg, setApplyMsg] = useState('');
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
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

    return (
        <div
            className={`
                bg-white shadow-2xl overflow-hidden flex flex-col
                fixed bottom-0 inset-x-0 w-full h-[95dvh] rounded-t-[32px] rounded-b-none
                md:static md:w-[500px] lg:w-[600px] md:h-auto md:max-h-[90vh] md:rounded-[32px]
                transform-gpu will-change-transform backface-hidden
            `}
            onClick={e => e.stopPropagation()}
        >
            {/* 1. HEADER SECTION */}
            <div className={`relative px-6 py-4 md:py-5 bg-gradient-to-br ${headerBg} text-white flex flex-col items-center text-center gap-3 shrink-0 shadow-lg`}>

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
                <div className="w-full bg-white px-4 md:px-6 py-3 rounded-[24px] shadow-xl border border-white/50 flex flex-col items-center justify-center gap-2">
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
                <div className="flex items-center gap-2 opacity-95 font-black text-[12px] md:text-[13px] bg-black/10 px-3 py-1 rounded-full">
                    {cleanShopTitle(undefined, shop.nickname || shop.name)}
                </div>
            </div>

            {/* 2. BODY SECTION */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-gray-50/30 relative">
                {/* Ad No */}
                <div className="absolute top-2 right-4 text-[10px] font-mono font-bold text-gray-400 select-all z-10">
                    No.{shop.adNo || String(shop.id ?? '').substring(0, 4) || '1004'}
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
                            dangerouslySetInnerHTML={{ 
                                __html: (shop.description || `<p>${shop.name}에서 열정적인 분을 모십니다!</p>`)
                                    .replace(/foxalba\.com|queenalba\.net|ladyalba\.co\.kr/gi, 'cocoalba.kr')
                                    .replace(/여우알바|퀸알바|레이디알바|악녀알바|버블알바|슈슈알바/g, '코코알바')
                                    .replace(/엔터프라이즈|인재솔루션|인재알바/g, '고수익알바')
                            }}
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
                                
                                // [2026-04-01] 필터링 강화: 저효율 키워드 및 금지어 제거
                                const filterOut = ['숙식제공', '초보가능', '자유출퇴근', '텃세없음', '실장친절', '손님많음'];
                                const forbidden = ['엔터프라이즈', '최엔터프라이즈', '엔터프라이즈알바', '인재', '솔루션', '레이디알바', '전문', '인재 솔루션'];
                                
                                const allKeywords = Array.from(new Set([...userKeywords, ...autoKeywords]))
                                    .filter((kw: any) => {
                                        const cleanKw = String(kw).replace('#', '').trim();
                                        if (!cleanKw) return false;
                                        // 저효율 키워드 완전 일치 필터링
                                        if (filterOut.includes(cleanKw)) return false;
                                        // 금지어 포함 필터링
                                        if (forbidden.some(f => cleanKw.includes(f))) return false;
                                        return true;
                                    });

                                if (allKeywords.length > 0) {
                                    return allKeywords.map((kw: any, i: number) => (
                                        <span key={i} className="px-2 py-1 rounded bg-white border border-gray-200 text-gray-400 text-[10px] font-medium">
                                            #{String(kw).replace('#', '')}
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

            {/* 신고 링크 */}
            <div className="px-6 py-2 bg-white flex justify-end">
                <button
                    onClick={() => setShowReport(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors"
                >
                    <Flag size={11} />
                    신고
                </button>
            </div>

            {showReport && <ReportAdModal onClose={() => setShowReport(false)} />}

            {/* 온라인 지원 섹션 (개인회원만) */}
            {isLoggedIn && userType === 'individual' && (
                <div className="mx-6 mb-2 p-3 rounded-2xl border border-blue-100 bg-blue-50/50">
                    {applied ? (
                        <div className="flex items-center gap-2 text-green-600 font-black text-sm justify-center py-2">
                            <CheckCircle size={18} /> 지원이 완료되었습니다!
                        </div>
                    ) : !showApplyForm ? (
                        <button
                            onClick={() => {
                                setApplyName((user as any)?.full_name || (user as any)?.nickname || '');
                                setApplyPhone((user as any)?.phone || '');
                                setShowApplyForm(true);
                            }}
                            className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                        >
                            <ClipboardList size={16} /> 온라인 지원하기
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-xs font-black text-blue-700 mb-2">지원 정보 입력</p>
                            <input value={applyName} onChange={e => setApplyName(e.target.value)}
                                placeholder="이름 *" className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                            <input value={applyPhone} onChange={e => setApplyPhone(e.target.value)}
                                placeholder="연락처 *" className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                            <textarea value={applyMsg} onChange={e => setApplyMsg(e.target.value)}
                                placeholder="한 줄 소개 (선택)" rows={2}
                                className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300" />
                            <div className="flex gap-2">
                                <button onClick={() => setShowApplyForm(false)}
                                    className="flex-1 py-2 rounded-xl border border-blue-200 text-blue-500 text-xs font-black">취소</button>
                                <button
                                    disabled={applying || !applyName.trim() || !applyPhone.trim()}
                                    onClick={async () => {
                                        setApplying(true);
                                        try {
                                            await supabase.from('applications').insert({
                                                shop_id: shop.id,
                                                user_id: user?.id || null,
                                                applicant_name: applyName.trim(),
                                                applicant_phone: applyPhone.trim(),
                                                message: applyMsg.trim() || null,
                                                status: 'pending',
                                                created_at: new Date().toISOString(),
                                            });
                                            setApplied(true);
                                            setShowApplyForm(false);
                                        } catch {
                                            alert('지원 접수 중 오류가 발생했습니다.');
                                        } finally {
                                            setApplying(false);
                                        }
                                    }}
                                    className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-black flex items-center justify-center gap-1 disabled:opacity-60 hover:bg-blue-700 transition"
                                >
                                    {applying ? <Loader2 size={14} className="animate-spin" /> : '지원 제출'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 3. FOOTER SECTION */}
            <div className="px-4 py-3 bg-white border-t border-gray-100 grid grid-cols-4 gap-2 shrink-0 safe-area-bottom">
                <button
                    onClick={() => {
                        const event = new CustomEvent('open-note-modal', {
                            detail: { receiver: shop.managerName || shop.nickname || `${shop.name} 사장님` }
                        });
                        window.dispatchEvent(event);
                    }}
                    className="col-span-1 py-3 bg-gray-50 border border-gray-100 text-gray-600 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition shadow-sm group"
                >
                    <MessageSquare size={18} className="text-gray-400" />
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
                    className="col-span-1 py-3 bg-amber-400 text-black rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-amber-500 transition shadow-sm font-black group"
                >
                    <MessageCircle size={18} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px]">카톡문의</span>
                </button>
                <a
                    href={`tel:${shop.phone}`}
                    className="col-span-2 py-3 bg-[#f82b60] text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-[#db2456] transition shadow-lg shadow-[#f82b60]/30 group"
                >
                    <Phone size={17} fill="currentColor" className="group-hover:animate-bounce shrink-0" />
                    <span className="text-[13px] font-black">전화/문자문의</span>
                </a>
            </div>
        </div>
    );
};

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ shop, onClose, isFavorite, onToggleFavorite }) => {
    const [mounted, setMounted] = useState(false);
    const [publisherAddress, setPublisherAddress] = useState<string | null>(null);
    useBodyScrollLock(!!shop);

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
