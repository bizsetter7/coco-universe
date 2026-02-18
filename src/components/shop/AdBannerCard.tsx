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
 * 🎨 AdBannerCard (Grand/Premium)
 * - PC/Mobile 공통 레이아웃 구조 적용
 * - 이미지: 상단 꽉 채움, 하단 각진 모서리(Angled)
 * - 순서: 이미지 -> 지역/업종 -> 닉네임 -> 제목 -> 급여
 */
export const AdBannerCard = React.memo(({ shop }: AdBannerCardProps) => {
    const isMobile = useMobile();

    // 제목 추출 및 정제
    const cleanTitle = cleanShopTitle(shop.title, shop.name);
    const [imgError, setImgError] = React.useState(false);

    // Determine image URL
    const mediaUrl = shop.options?.mediaUrl || getShopDefaultImage(shop.workType);

    return (
        <div className={`
            h-full flex flex-col group relative rounded-2xl cursor-pointer transition-[transform,box-shadow] duration-200
            ${!isMobile ? 'hover:scale-[1.02] active:scale-95' : 'active:scale-95'} 
            bg-white overflow-hidden border border-gray-200 shadow-md shadow-gray-200/50 pb-2
        `}>

            {/* NEW 배지 - 바깥 테두리 안쪽 상단 좌측 */}
            {shop.options?.blink && (
                <div className="absolute top-0 left-0 z-50 overflow-hidden w-14 h-14 pointer-events-none rounded-tl-2xl">
                    <div className="absolute top-[6px] left-[-22px] bg-red-600 text-white text-[9px] font-black py-1 w-20 text-center -rotate-45 shadow-[0_2px_4px_rgba(0,0,0,0.3)] uppercase tracking-tighter">
                        NEW
                    </div>
                </div>
            )}

            {/* 1. 상단: 이미지 (꽉 채움, 하단 각진 모서리) */}
            <div className={`relative w-full aspect-[4/3] bg-gray-50 border-b border-gray-100 overflow-hidden`}>
                {!imgError ? (
                    <>
                        <img
                            src={mediaUrl}
                            alt=""
                            onError={() => setImgError(true)}
                            loading="lazy"
                            className={`w-full h-full object-cover transition-transform duration-700 ${!isMobile ? 'group-hover:scale-110' : ''}`}
                        />
                        {/* 투명도 조절 오버레이 */}
                        <div className={`absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent z-10`} />
                    </>
                ) : (
                    // [Fix] 이미지 로드 실패/누락 시 Fallback UI (텍스트 모드 느낌의 깔끔한 배경)
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center">
                        <span className="text-3xl mb-1">🏰</span>
                        <span className="text-xs font-bold text-slate-500">{shop.workType || '채용 공고'}</span>
                    </div>
                )}
            </div>

            {/* 내부 컨텐츠 영역 */}
            <div className="px-2 pt-1.5 flex flex-col gap-1 overflow-hidden font-medium flex-1">

                {/* 2. 좌측: 지역-상세 / 우측: 업종-상세 */}
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
                        {shop.options.paySuffixes.slice(0, 3).map((suffix: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 text-[9px] font-bold rounded border border-gray-100 whitespace-nowrap">
                                {suffix}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

AdBannerCard.displayName = 'AdBannerCard';
