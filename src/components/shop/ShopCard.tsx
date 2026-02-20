import React from 'react';
import { Shop } from '@/types/shop';
import { formatKoreanMoney } from '@/utils/formatMoney';
import { getPayColor } from '@/utils/payColors';
import { getHighlighterStyle } from '@/utils/highlighter';
import { cleanShopTitle, getShopDefaultImage } from '@/utils/shopUtils';
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

// [Optimization] Memoized ShopCard
export const ShopCard = React.memo(({ shop, rank, tierLabel, tierId, onClick, hideImage }: ShopCardProps) => {
    const isMobile = useMobile();
    const [imgError, setImgError] = React.useState(false);

    // Determine media strategy
    const hasCustomMedia = !!shop.options?.mediaUrl;
    const mediaUrl = shop.options?.mediaUrl;

    // Premium Gradient Generator for Text Banners
    const getPremiumGradient = (id: string) => {
        const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const gradients = [
            'from-slate-800 to-slate-900',
            'from-indigo-800 to-purple-900',
            'from-rose-800 to-red-900',
            'from-blue-800 to-indigo-900',
            'from-emerald-800 to-teal-900',
            'from-amber-700 to-orange-800',
        ];
        return gradients[hash % gradients.length];
    };

    // 급구/추천 섹션은 이미지를 표시하지 않음 (텍스트 위주)
    const isUrgentType = tierId === 'urgent' || tierId === 'recommended';

    // Deluxe, Special은 이미지를 표시함
    // 단, hideImage가 true면 강제로 숨김 (AdSection에서 기본 이미지 fallback 방지용)
    const showImage = !isUrgentType && !hideImage;

    // Clean title for display
    const cleanTitle = cleanShopTitle(shop.title, shop.name);

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

            {/* 1. 상단: 프리미엄 텍스트 배너 (사진 완전 제거) - 급구 제외 */}
            {showImage && (
                <div className={`relative w-full aspect-[4/3] overflow-hidden bg-slate-900 border-b border-gray-100`}>
                    {/* Main Premium Gradient Display */}
                    <div className={`absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br ${getPremiumGradient(shop.id)}`}>
                        {/* Banner Render */}
                        <div className="relative z-10 w-full px-2">
                            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block leading-none">{shop.workType || 'JOB POST'}</span>
                            <h4 className="text-white font-black text-[15px] leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] break-keep text-center">
                                {cleanTitle}
                            </h4>
                            <div className="w-8 h-0.5 bg-white/20 mx-auto mt-2.5 rounded-full" />
                        </div>
                    </div>

                    {/* Rank Badge (if used) */}
                    {rank && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-md z-20">
                            <span className="text-[10px] font-black text-black">{rank}</span>
                        </div>
                    )}
                </div>
            )}

            {/* 내부 컨텐츠 영역 */}
            <div className={`px-2 ${showImage ? 'pt-1.5' : 'pt-3'} flex flex-col gap-1 overflow-hidden font-medium flex-1 justify-between`}>

                {/* 2. 지역/업종 표시 영역 (이미지 유무에 따른 분기) */}
                {!showImage ? (
                    // [Urgent/Recommended Case] No Image -> Stacked Right Layout to avoid NEW badge
                    <div className="flex flex-col items-end gap-0.5 mb-1.5 pt-1">
                        <div className="truncate text-[11px] text-gray-500 font-bold text-right w-full pl-8">
                            {shop.region}
                        </div>
                        <div className="truncate text-[11px] font-bold text-gray-400 text-right w-full pl-8">
                            {shop.workType || '업종'}
                        </div>
                    </div>
                ) : (
                    // [Grand/Premium/Deluxe/Special Case] With Image -> Standard Layout
                    <>
                        {/* 2. 좌측: 지역 / 우측: 업종 */}
                        <div className="flex justify-between items-baseline gap-2 pb-0.5">
                            <div className="truncate text-[11px] text-gray-500 font-bold">
                                {shop.region}
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <span className="text-[11px] font-bold text-gray-400 truncate">
                                    {shop.workType || '업종'}
                                </span>
                            </div>
                        </div>

                        {/* 3. 닉네임 */}
                        <div className="text-[11px] font-bold text-gray-800 truncate -mt-0.5">
                            {shop.nickname || cleanShopTitle(undefined, shop.name)}
                        </div>
                    </>
                )}

                {/* 4. 아이콘+형광펜+공고제목 (1줄 제한 - Flex Refactor) */}
                <div className="flex items-center gap-1 w-full min-w-0">
                    <IconBadge
                        iconId={shop.options?.icon}
                        className="text-[13px] shrink-0"
                        textOnly={isMobile}
                    />
                    <h3
                        className="text-[13px] font-black leading-snug line-clamp-2 w-full break-all"
                        style={getHighlighterStyle(shop.options?.highlighter)}
                    >
                        {cleanTitle}
                    </h3>
                </div>

                {/* 5. 좌측: 급여종류배지+급여액 */}
                <div className="flex items-center gap-1 overflow-hidden mt-0.5">
                    <span className={`text-[10px] font-black w-[18px] h-[18px] flex items-center justify-center rounded-[4px] ${getPayColor(shop.payType || '시급')} whitespace-nowrap flex-shrink-0 text-white shadow-sm`}>
                        {shop.payType?.substring(0, 1) || '시'}
                    </span>
                    <span className="text-[13px] font-black text-gray-900 tracking-tighter truncate">
                        {formatKoreanMoney(shop.pay || 0)}
                    </span>
                </div>

                {/* 6. 급여추가옵션 */}
                {shop.options?.paySuffixes && shop.options.paySuffixes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                        {shop.options.paySuffixes.slice(0, isUrgentType ? 4 : 2).map((suffix: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 text-[9px] font-bold rounded border border-gray-100 whitespace-nowrap">
                                {suffix}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </a >
    );
});

ShopCard.displayName = 'ShopCard';
