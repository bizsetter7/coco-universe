import React from 'react';
import { Crown, Star, Sparkles, Flame } from 'lucide-react';
import { Shop } from '@/types/shop';
import { useBrand } from '../BrandProvider';
import { formatKoreanMoney } from '@/utils/formatMoney';
import { getPayColor } from '@/utils/payColors';

interface ShopCardProps {
    shop: Shop;
    rank?: number;
    tierLabel?: string;
    tierColor?: string;
    isGrand?: boolean;
}

// [Optimization] Extracted Badge Component
const ShopBadge = React.memo(({ hasBlink }: { hasBlink?: boolean }) => {
    if (!hasBlink) return null;

    return (
        <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
            {hasBlink && (
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded shadow-md bg-red-600 text-white animate-pulse">
                    NEW
                </span>
            )}
        </div>
    );
});
ShopBadge.displayName = 'ShopBadge';

// [Optimization] Memoized ShopCard
export const ShopCard = React.memo(({ shop, rank, tierLabel, tierColor, isGrand }: ShopCardProps) => {
    const brand = useBrand();
    const isDark = brand.theme === 'dark';

    // Image Error Handling state could be expensive if many fail at once,
    // but React handles this reasonably well.
    // Ideally use a lightweight skeleton or fallback via CSS to avoid js state, but for now this is standard.
    // [Optimization] We can omit the state if we accept a default "broken image" look or use a simple <object> tag trick.
    // Keeping state for now but ensuring memoization helps.

    const isPremium = tierLabel === 'PREMIUM' || tierLabel === '프리미엄' || tierLabel === 'GRAND' || tierLabel === '그랜드';

    return (
        <div className={`group relative flex flex-col gap-3 p-1 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] active:scale-95 !bg-white ${isPremium ? 'border-2 border-amber-400 shadow-xl shadow-amber-500/10' : 'border border-gray-100 shadow-sm shadow-gray-200/50'}`} style={{ mixBlendMode: 'normal' }}>
            <div className="w-full h-full bg-white rounded-xl p-2 relative overflow-hidden shadow-sm border border-gray-100">

                {/* Image / Thumbnail Area */}
                <div className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 transform-gpu`}>
                    {/* Badge (Extracted) - Now only shows NEW */}
                    <ShopBadge hasBlink={shop.options?.blink} />

                    {shop.options?.mediaUrl ? (
                        <img
                            src={shop.options.mediaUrl}
                            alt={shop.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                            <Crown size={32} />
                        </div>
                    )}

                    {/* Gradient Overlay for Text Readability - Lightweight CSS */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                    {/* Rank Badge (if used) */}
                    {rank && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-md z-10">
                            <span className="text-xs font-black text-black">{rank}</span>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-gray-500 bg-gray-100`}>
                            {shop.region}
                        </span>
                    </div>

                    <h3 className={`text-[15px] font-bold leading-tight line-clamp-1 !text-gray-900 force-dark-text`}>
                        {(shop.title || shop.name).replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, '').trim()}
                    </h3>

                    {/* Pay Info Logic */}
                    <div className={`flex items-center gap-1 mt-0.5`}>
                        {/* Badge for Pay Type (Position 2: Fixed Badge, 1 Char) */}
                        <span className={`text-[10px] font-black w-[20px] h-[20px] flex items-center justify-center rounded ${getPayColor(shop.payType || '시급')} whitespace-nowrap min-w-[20px] text-center`}>
                            {shop.payType?.substring(0, 1) || '시'}
                        </span>
                        {/* Pay Amount */}
                        <div className={`text-[11px] md:text-[12px] font-black tracking-tighter !text-gray-800 force-dark-text`}>
                            {formatKoreanMoney(shop.pay)}
                        </div>
                    </div>

                    {/* [Restored Content] Line 3: Keywords (Subtle) */}
                    {shop.keywords && shop.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {shop.keywords.slice(0, 3).map((keyword: string, i: number) => (
                                <span key={i} className="text-[10px] font-normal text-gray-400 bg-gray-50/80 px-1.5 py-0.5 rounded border border-gray-100/50">
                                    #{keyword}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
});
ShopCard.displayName = 'ShopCard';
