import React from 'react';
import { Shop } from '@/types/shop';
import { useMobile } from '@/hooks/useMobile';
import { formatKoreanMoney } from '@/utils/formatMoney';
import { getPayColor } from '@/utils/payColors';
import { getHighlighterStyle } from '@/utils/highlighter';
import { cleanShopTitle, getShopDefaultImage } from '@/utils/shopUtils';
import { IconBadge } from '../common/IconBadge';

interface AdBannerCardProps {
    shop: Shop;
}

/**
 * 🎨 AdBannerCard
 * 밤이슬알바 스타일의 화려하고 동적인 광고 배너 컴포넌트
 */
export const AdBannerCard = React.memo(({ shop }: AdBannerCardProps) => {
    const isMobile = useMobile(); // [Optimization] Detect mobile environment

    // 제목 추출 및 정제
    const cleanTitle = cleanShopTitle(shop.title, shop.name);

    const [imgError, setImgError] = React.useState(false);

    // Determine image URL
    const mediaUrl = shop.options?.mediaUrl || getShopDefaultImage(shop.workType);
    const hasMedia = !!mediaUrl && !imgError;

    return (
        <div className={`
            group relative flex flex-col p-1 rounded-2xl cursor-pointer transition-[transform,box-shadow] duration-200
            ${!isMobile ? 'hover:scale-[1.02] active:scale-95' : 'active:scale-95'} bg-white overflow-hidden h-full
            border border-gray-200 shadow-md shadow-gray-200/50
        `}>

            {/* NEW 배지 - 바깥 테두리 안쪽 상단 좌측 (inner box 위) */}
            {shop.options?.blink && (
                <div className="absolute top-0 left-0 z-50 overflow-hidden w-14 h-14 pointer-events-none">
                    <div className="absolute top-[6px] left-[-22px] bg-red-600 text-white text-[9px] font-black py-1 w-20 text-center -rotate-45 shadow-[0_2px_4px_rgba(0,0,0,0.3)] uppercase tracking-tighter">
                        NEW
                    </div>
                </div>
            )}

            {/* 내부 컨텐츠 영역 */}
            <div className="w-full h-full bg-white rounded-xl p-2 relative overflow-hidden flex flex-col gap-2">

                {/* 미디어 영역 (이미지/GIF OR 타이틀 배너) */}
                <div className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-50 border border-gray-100`}>
                    <img
                        src={mediaUrl}
                        alt=""
                        onError={() => setImgError(true)}
                        loading="lazy"
                        className={`w-full h-full object-cover transition-transform duration-700 ${!isMobile ? 'group-hover:scale-110' : ''}`}
                    />

                    {!shop.options?.mediaUrl && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-black/50 backdrop-blur-[2px]">
                            <span className="text-[13px] font-black text-white line-clamp-2 leading-tight break-keep drop-shadow-lg">
                                {cleanTitle}
                            </span>
                            <div className="mt-2 text-[9px] font-black text-amber-300 uppercase tracking-[0.2em] drop-shadow-md">
                                GRAND PREMIUM
                            </div>
                        </div>
                    )}

                    {/* 투명도 조절 오버레이 (이미지일 때만) */}
                    <div className={`absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent z-10`} />
                </div>

                {/* Content Area (정보 노출 영역) */}
                <div className="px-1 py-0.5 flex flex-col gap-1.5 overflow-hidden font-medium">
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
                                {shop.options.paySuffixes.slice(0, 3).map((suffix: string, i: number) => (
                                    <span key={i} className="px-1 py-0.5 bg-gray-50 text-gray-400 text-[8px] font-bold rounded border border-gray-100/50 whitespace-nowrap">
                                        {suffix}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
});

AdBannerCard.displayName = 'AdBannerCard';
