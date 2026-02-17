import React from 'react';
import { Shop } from '@/types/shop';
import { formatKoreanMoney } from '@/utils/formatMoney';
import { getPayColor } from '@/utils/payColors';
import { getHighlighterStyle } from '@/utils/highlighter';
import { cleanShopTitle } from '@/utils/shopUtils';
import { IconBadge } from '../common/IconBadge';

interface ShopCardProps {
    shop: Shop;
    rank?: number;
    tierLabel?: string;
    tierId?: string;
    onClick?: (e: React.MouseEvent) => void;
}

// [Optimization] Memoized ShopCard
export const ShopCard = React.memo(({ shop, rank, tierLabel, tierId, onClick }: ShopCardProps) => {

    // Image Error Handling state could be expensive if many fail at once,
    // but React handles this reasonably well.
    // Ideally use a lightweight skeleton or fallback via CSS to avoid js state, but for now this is standard.
    // [Optimization] We can omit the state if we accept a default "broken image" look or use a simple <object> tag trick.
    // Keeping state for now but ensuring memoization helps.

    const [imgError, setImgError] = React.useState(false);
    const hasMedia = !!shop.options?.mediaUrl && !imgError;

    // 급구/추천 섹션 전체가 이미지 배제 모드일 때만 비활성화 (섹션 내 밸런스 유지)
    const isUrgentType = tierId === 'urgent' || tierId === 'recommended';

    // Clean title for display
    const cleanTitle = cleanShopTitle(shop.title, shop.name);

    // [Standardization] All cards now have the same 'Plain' (담백한) style
    return (
        <a
            href={`/shop/${shop.id}`}
            onClick={(e) => {
                if (onClick) {
                    e.preventDefault();
                    onClick(e);
                }
            }}
            className={`group relative flex flex-col p-1 rounded-2xl cursor-pointer transition-[transform,box-shadow] duration-200 hover:scale-[1.01] active:scale-95 !bg-white border border-gray-200 shadow-md shadow-gray-200/50 ${!isUrgentType ? 'h-full' : ''}`}
        >
            <div className={`w-full bg-white rounded-xl p-2 relative overflow-hidden flex flex-col gap-2 ${!isUrgentType ? 'h-full' : ''}`}>

                {/* Image / Thumbnail Area (OR Title Banner Fallback) */}
                {!isUrgentType && (
                    <div className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden ${hasMedia ? 'bg-gray-100' : 'bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100'}`}>
                        {hasMedia ? (
                            <img
                                src={shop.options!.mediaUrl}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                onError={() => setImgError(true)}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
                                <span className="text-[11px] font-black text-gray-400 line-clamp-3 leading-tight break-keep">
                                    {cleanTitle}
                                </span>
                                <div className="mt-2 text-[8px] font-bold text-gray-300 uppercase tracking-widest opacity-50">
                                    {tierLabel || 'INFO'}
                                </div>
                            </div>
                        )}

                        {/* Gradient Overlay (only for images) */}
                        {hasMedia && <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-40" />}

                        {/* Rank Badge (if used) */}
                        {rank && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-md z-10">
                                <span className="text-xs font-black text-black">{rank}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Content Area (정보 노출 영역) */}
                <div className={`px-1 ${isUrgentType ? 'py-0.5' : 'py-0.5'} flex flex-col gap-1.5 overflow-hidden`}>
                    {/* [Row 1] 지역 + 업종 (완벽 수평 정렬 - 베이스라인 기준) */}
                    <div className="flex justify-between items-baseline gap-2 border-b border-gray-50 pb-1 mb-0.5">
                        <div className="truncate text-[10px] text-gray-400 font-bold">
                            {shop.region}
                        </div>
                        <div className="flex-shrink-0 text-right">
                            <span className="text-[10px] font-bold text-gray-300 truncate">
                                {shop.workType || '업종'}
                            </span>
                        </div>
                    </div>

                    {/* [Row 2] 제목 (하이라이터 적용) */}
                    <div className="min-w-0 flex items-center gap-1">
                        <IconBadge iconId={shop.options?.icon} className="text-[12px]" />
                        <h3
                            className="text-[12px] font-black leading-tight line-clamp-2 transition-all inline-block max-w-full"
                            style={getHighlighterStyle(shop.options?.highlighter)}
                        >
                            {cleanTitle}
                        </h3>
                    </div>

                    {/* 닉네임 (사장님 요청으로 비움) */}
                    <div className="h-0 hidden"></div>

                    {/* [Row 3] 급여 정보 */}
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 overflow-hidden">
                            <span className={`text-[9px] font-black w-[16px] h-[16px] flex items-center justify-center rounded ${getPayColor(shop.payType || '시급')} whitespace-nowrap flex-shrink-0 text-white shadow-sm`}>
                                {shop.payType?.substring(0, 1) || '시'}
                            </span>
                            <span className="text-[11px] font-black text-gray-900 tracking-tighter truncate">
                                {formatKoreanMoney(shop.pay || 0)}
                            </span>
                        </div>

                        {/* 급여 추가 키워드 (시스템 연동) */}
                        {shop.options?.paySuffixes && shop.options.paySuffixes.length > 0 && (
                            <div className="flex flex-wrap gap-0.5">
                                {shop.options.paySuffixes.slice(0, isUrgentType ? 4 : 2).map((suffix: string, i: number) => (
                                    <span key={i} className="px-1 py-0.5 bg-gray-50 text-gray-400 text-[8px] font-bold rounded border border-gray-100/50 whitespace-nowrap">
                                        {suffix}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </a >
    );
});
ShopCard.displayName = 'ShopCard';
