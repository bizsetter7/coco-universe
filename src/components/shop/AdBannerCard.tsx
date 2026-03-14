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

    // Force Text Banner Design (Ignore all media metadata)
    const hasCustomMedia = false;

    // Premium Gradient Generator for Text Banners
    const getPremiumGradient = (id: string) => {
        const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const gradients = [
            'from-slate-900 via-slate-800 to-slate-900',
            'from-indigo-950 via-purple-900 to-indigo-900',
            'from-rose-950 via-red-900 to-rose-900',
            'from-blue-950 via-indigo-900 to-blue-900',
            'from-emerald-950 via-teal-900 to-emerald-950',
            'from-amber-950 via-yellow-900 to-amber-950',
        ];
        return gradients[hash % gradients.length];
    };

    return (
        <div className={`
            h-full flex flex-col group relative rounded-2xl cursor-pointer transition-[transform,box-shadow] duration-200
            ${!isMobile ? 'hover:scale-[1.02] active:scale-95' : 'active:scale-95'} 
            bg-white overflow-hidden border border-gray-200 shadow-md shadow-gray-200/50 pb-2
        `}>

            {/* NEW 배지 */}
            {shop.options?.blink && (
                <div className="absolute top-0 left-0 z-50 overflow-hidden w-14 h-14 pointer-events-none rounded-tl-2xl">
                    <div className="absolute top-[6px] left-[-22px] bg-red-600 text-white text-[9px] font-black py-1 w-20 text-center -rotate-45 shadow-[0_2px_4px_rgba(0,0,0,0.3)] uppercase tracking-tighter">
                        NEW
                    </div>
                </div>
            )}

            {/* 1. 상단: 프리미엄 텍스트 배너 (사진 일절 제거) */}
            <div className={`relative w-full aspect-[4/3] overflow-hidden bg-slate-950 border-b border-gray-100`}>
                {/* Main Premium Gradient Display */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br ${getPremiumGradient(shop.id)}`}>
                    {/* Background Deco Patterns */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse" />
                    </div>

                    {/* Banner Main Content */}
                    <div className="relative z-10 space-y-2">
                        <div className="inline-block px-2.5 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/20 mb-1 shadow-sm">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{shop.workType || 'PREMIUM AD'}</span>
                        </div>
                        <h2 className="text-white font-black text-xl md:text-2xl leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] tracking-tighter break-keep">
                            {cleanTitle}
                        </h2>
                        <div className="w-12 h-1 bg-amber-400 mx-auto rounded-full mt-3 shadow-glow-amber animate-width" />
                        <p className="text-[11px] font-bold text-white/60 tracking-widest mt-2 uppercase">{shop.nickname || shop.name}</p>
                    </div>
                </div>

                {/* Edge Overlay */}
                <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)] pointer-events-none" />
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
