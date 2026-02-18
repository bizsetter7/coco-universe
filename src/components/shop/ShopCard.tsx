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
}

// [Optimization] Memoized ShopCard
export const ShopCard = React.memo(({ shop, rank, tierLabel, tierId, onClick }: ShopCardProps) => {
    const isMobile = useMobile();
    const [imgError, setImgError] = React.useState(false);

    // Determine image URL
    const mediaUrl = shop.options?.mediaUrl || getShopDefaultImage(shop.workType);

    // 급구/추천 섹션은 이미지를 표시하지 않음 (텍스트 위주)
    const isUrgentType = tierId === 'urgent' || tierId === 'recommended';

    // Deluxe, Special은 이미지를 표시함 (AdBannerCard와 유사한 스타일)
    const showImage = !isUrgentType;

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
            className={`group relative flex flex-col rounded-2xl cursor-pointer transition-[transform,box-shadow] duration-200 
            ${!isMobile ? 'hover:scale-[1.01] active:scale-95' : 'active:scale-95'}
            !bg-white border border-gray-200 shadow-md shadow-gray-200/50 pb-2 overflow-hidden h-full`}
        >
            {/* NEW 배지 - 상단 좌측 */}
            {shop.options?.blink && (
                <div className="absolute top-0 left-0 z-50 overflow-hidden w-14 h-14 pointer-events-none rounded-tl-2xl">
                    <div className="absolute top-[6px] left-[-22px] bg-red-600 text-white text-[9px] font-black py-1 w-20 text-center -rotate-45 shadow-[0_2px_4px_rgba(0,0,0,0.3)] uppercase tracking-tighter">
                        NEW
                    </div>
                </div>
            )}

            {/* 1. 상단: 이미지 (꽉 채움, 하단 각진 모서리) - 급구 제외 */}
            {showImage && (
                <div className={`relative w-full aspect-[4/3] bg-gray-50 border-b border-gray-100`}>
                    <img
                        src={mediaUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Rank Badge (if used) */}
                    {rank && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-md z-10">
                            <span className="text-[10px] font-black text-black">{rank}</span>
                        </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-40" />
                </div>
            )}

            {/* 내부 컨텐츠 영역 */}
            <div className={`px-2 ${showImage ? 'pt-1.5' : 'pt-3'} flex flex-col gap-1 overflow-hidden font-medium`}>

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
