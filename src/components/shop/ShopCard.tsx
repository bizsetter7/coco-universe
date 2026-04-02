import React from 'react';
import { Shop } from '@/types/shop';
import { formatKoreanMoney } from '@/utils/formatMoney';
import { getPayColor } from '@/utils/payColors';
import { getHighlighterStyle } from '@/utils/highlighter';
import { cleanShopTitle } from '@/utils/shopUtils';
import { IconBadge } from '../common/IconBadge';
import { useMobile } from '@/hooks/useMobile';

interface ShopCardProps {
    shop: Shop;
    rank?: number;
    tierLabel?: string;
    tierId?: string;
    onClick?: (e: React.MouseEvent) => void;
    hideImage?: boolean;
}

/**
 * ShopCard (Deluxe/Special/Urgent/Recommended/Native/Basic)
 *
 * [이미지 있는 카드 - Deluxe/Special]
 *   이미지 섹션: 이미지 있으면 이미지, 없으면 공고 제목만 표시
 *   하단 3-Row 규칙:
 *     Row1: 담당자 광고닉네임(좌) | 지역정보(우)
 *     Row2: 급여종류배지+급여(좌) | 업종정보(우)
 *     Row3: 추가급여옵션(paySuffixes)
 *
 * [이미지 없는 카드 - Urgent/Recommended]
 *   이미지 섹션 없음, 텍스트 위주 레이아웃 유지
 */
export const ShopCard = React.memo(({ shop, rank, tierLabel, tierId, onClick, hideImage }: ShopCardProps) => {
    const isMobile = useMobile();
    const [imgError, setImgError] = React.useState(false);

    const hasImage = !!shop.options?.mediaUrl && !imgError;
    const isUrgentType = tierId === 'urgent' || tierId === 'recommended';
    const showImage = !isUrgentType && !hideImage;
    const cleanTitle = cleanShopTitle(shop.title, shop.name);
    const paySuffixes: string[] = shop.options?.paySuffixes || (shop.options as any)?.pay_suffixes || (shop as any).paySuffixes || [];
    const badgeChar = shop.payType?.substring(0, 1) || '시';

    // AD_TIER_STANDARDS 동기화 — 이미지 없을 때 등급별 고정 그라디언트 (2026-03-22)
    const getTierGradient = (tid: string): string => {
        switch (tid) {
            case 'deluxe':      return 'from-blue-600 to-blue-700';        // 🔵 Deluxe
            case 'special':     return 'from-emerald-600 to-emerald-700';  // 🟢 Special
            case 'urgent':      return 'from-purple-600 to-purple-700';     // 🟣 Urgent/Recommended
            case 'recommended': return 'from-purple-600 to-purple-700';    // 🟣 Urgent/Recommended
            case 'native':      return 'from-slate-600 to-slate-700';      // ⬛ Native
            case 'basic':       return 'from-stone-700 to-stone-800';      // 🪨 Basic
            default:            return 'from-stone-700 to-stone-800';
        }
    };

    return (
        <a
            href={`/shop/${shop.id}`}
            onClick={(e) => {
                if (onClick) {
                    e.preventDefault();
                    onClick(e);
                }
            }}
            className={`h-full flex flex-col group relative rounded-2xl cursor-pointer transition-[transform,box-shadow] duration-200
            ${!isMobile ? 'hover:scale-[1.01] active:scale-95' : 'active:scale-95'}
            !bg-white border border-gray-200 shadow-md shadow-gray-200/50 pb-2 overflow-hidden`}
        >
            {/* NEW 배지 - 상단 좌측 */}
            {shop.options?.blink && (
                <div className="absolute top-0 left-0 z-50 overflow-hidden w-14 h-14 pointer-events-none rounded-tl-2xl">
                    <div className="absolute top-[6px] left-[-22px] bg-red-600 text-white text-[9px] font-black py-1 w-20 text-center -rotate-45 shadow-[0_2px_4px_rgba(0,0,0,0.3)] uppercase tracking-tighter">
                        NEW
                    </div>
                </div>
            )}

            {/* ── 이미지 섹션 (Deluxe/Special만 표시) ── */}
            {showImage && (
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-900 border-b border-gray-100">
                    {hasImage ? (
                        // 이미지 있을 경우: 이미지 표시
                        <img
                            src={shop.options!.mediaUrl}
                            alt={shop.name}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        // 이미지 없을 경우: 공고 제목만 중앙 표시
                        <div className={`absolute inset-0 flex items-center justify-center p-3 text-center bg-gradient-to-br ${getTierGradient(tierId || '')}`}>
                            <h4 className="relative z-10 text-white font-black text-[12px] leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] break-keep text-center line-clamp-4 w-full">
                                {cleanTitle}
                            </h4>
                        </div>
                    )}
                    {/* 순위 배지 */}
                    {rank && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-md z-20">
                            <span className="text-[10px] font-black text-black">{rank}</span>
                        </div>
                    )}
                </div>
            )}

            {/* ── 컨텐츠 영역 ── */}
            <div className={`px-2 ${showImage ? 'pt-1.5' : 'pt-2'} flex flex-col gap-1 overflow-hidden font-medium flex-1 ${showImage ? 'justify-between' : ''}`}>

                {showImage ? (
                    // ── [Deluxe/Special] 3-Row 규칙 ──
                    <>
                        {/* Row 1: 담당자 광고닉네임(좌) | 지역정보(우) */}
                        <div className="flex justify-between items-baseline gap-2 min-w-0">
                            <span className="text-[11px] font-bold text-gray-700 truncate flex-1">
                                {shop.nickname || shop.name}
                            </span>
                            <span className="text-[11px] font-semibold text-gray-400 truncate shrink-0 text-right">
                                {shop.region}
                            </span>
                        </div>

                        {/* Row 2: 급여종류배지+급여(좌) | 업종정보(우) */}
                        <div className="flex justify-between items-center gap-2 min-w-0">
                            <div className="flex items-center gap-1 min-w-0">
                                <span className={`text-[10px] font-black w-[18px] h-[18px] flex items-center justify-center rounded-[4px] ${getPayColor(shop.payType || '시급')} whitespace-nowrap flex-shrink-0 text-white shadow-sm`}>
                                    {badgeChar}
                                </span>
                                <span className="text-[13px] font-black text-gray-900 tracking-tighter truncate">
                                    {formatKoreanMoney(shop.pay || 0)}
                                </span>
                            </div>
                            <span className="text-[11px] font-bold text-gray-400 truncate shrink-0 text-right">
                                {shop.workType || '업종'}
                            </span>
                        </div>

                        {/* Row 3: 추가급여옵션 (paySuffixes) — 4개 이상 시 마퀴 슬라이드 */}
                        {paySuffixes.length > 0 && (
                            <div className="overflow-hidden max-h-[18px]">
                                {paySuffixes.length <= 3 ? (
                                    <div className="flex gap-1">
                                        {paySuffixes.map((suffix: string, i: number) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 text-[9px] font-bold rounded border border-gray-100 whitespace-nowrap leading-none">
                                                {suffix}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="keyword-marquee flex gap-1" style={{ width: 'max-content' }}>
                                        {[...paySuffixes, ...paySuffixes].map((suffix: string, i: number) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 text-[9px] font-bold rounded border border-gray-100 whitespace-nowrap leading-none">
                                                {suffix}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    // ── [Urgent/Recommended] 새 레이아웃: 1줄 제목 + 3-Row ──
                    <>
                        {/* 공고제목 (1줄 고정 · NEW 배지 충돌 방지 pl-6) */}
                        <div className="flex items-center gap-1 w-full min-w-0 pl-6 pt-0.5">
                            <IconBadge
                                iconId={shop.options?.icon}
                                className="text-[11px] shrink-0"
                                textOnly={isMobile}
                            />
                            <h3
                                className="text-[12px] font-black leading-tight line-clamp-1 w-full break-all"
                                style={getHighlighterStyle(shop.options?.highlighter)}
                            >
                                {cleanTitle}
                            </h3>
                        </div>

                        {/* Row 1: 업소명/닉네임(좌) | 지역(우) */}
                        <div className="flex justify-between items-baseline gap-2 min-w-0">
                            <span className="text-[10px] font-bold text-gray-600 truncate flex-1">
                                {shop.nickname || shop.name}
                            </span>
                            <span className="text-[10px] font-semibold text-gray-400 truncate shrink-0 text-right">
                                {shop.region}
                            </span>
                        </div>

                        {/* Row 2: 급여종류배지+급여(좌) | 업종(우) */}
                        <div className="flex justify-between items-center gap-2 min-w-0">
                            <div className="flex items-center gap-1 min-w-0">
                                <span className={`text-[10px] font-black w-[16px] h-[16px] flex items-center justify-center rounded-[3px] ${getPayColor(shop.payType || '시급')} whitespace-nowrap flex-shrink-0 text-white shadow-sm`}>
                                    {badgeChar}
                                </span>
                                <span className="text-[12px] font-black text-gray-900 tracking-tighter truncate">
                                    {formatKoreanMoney(shop.pay || 0)}
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 truncate shrink-0 text-right">
                                {shop.workType || '업종'}
                            </span>
                        </div>

                        {/* Row 3: 추가급여옵션 (paySuffixes) — 5개 이상 시 마퀴 슬라이드 */}
                        {paySuffixes.length > 0 && (
                            <div className="overflow-hidden max-h-[16px]">
                                {paySuffixes.length <= 4 ? (
                                    <div className="flex gap-1">
                                        {paySuffixes.map((suffix: string, i: number) => (
                                            <span key={i} className="px-1 py-0.5 bg-gray-50 text-gray-500 text-[9px] font-bold rounded border border-gray-100 whitespace-nowrap leading-none">
                                                {suffix}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="keyword-marquee flex gap-1" style={{ width: 'max-content' }}>
                                        {[...paySuffixes, ...paySuffixes].map((suffix: string, i: number) => (
                                            <span key={i} className="px-1 py-0.5 bg-gray-50 text-gray-500 text-[9px] font-bold rounded border border-gray-100 whitespace-nowrap leading-none">
                                                {suffix}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </a>
    );
});

ShopCard.displayName = 'ShopCard';
