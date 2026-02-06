import React from 'react';
import { Crown, Star } from 'lucide-react';
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
const ShopBadge = React.memo(({ tierLabel }: { tierLabel?: string }) => {
    if (!tierLabel) return null;

    let info = { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' };

    if (tierLabel === 'GRAND' || tierLabel === '그랜드') {
        info = { bg: 'bg-amber-900', text: 'text-amber-400', border: 'border-amber-700' };
    } else if (tierLabel === 'PREMIUM' || tierLabel === '프리미엄') {
        info = { bg: 'bg-slate-800', text: 'text-slate-200', border: 'border-slate-600' };
    } else if (tierLabel === 'DELUXE' || tierLabel === '디럭스') {
        info = { bg: 'bg-pink-900', text: 'text-pink-200', border: 'border-pink-700' };
    } else if (tierLabel === 'SPECIAL' || tierLabel === '스페셜') {
        info = { bg: 'bg-purple-900', text: 'text-purple-200', border: 'border-purple-700' };
    } else if (tierLabel === 'URGENT' || tierLabel === '급구') {
        info = { bg: 'bg-red-600', text: 'text-white', border: 'border-red-500' };
    } else if (tierLabel === 'RECOMMENDED' || tierLabel === '추천') {
        info = { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-500' };
    }

    return (
        <span className={`absolute top-3 left-3 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded shadow-sm z-10 ${info.bg} ${info.text} ${info.border} border`}>
            {tierLabel}
        </span>
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

    return (
        <div className={`group relative flex flex-col gap-3 p-3 rounded-2xl cursor-pointer ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-100'}`}>

            {/* Image / Thumbnail Area */}
            <div className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 transform-gpu`}>
                {/* Badge (Extracted) */}
                <ShopBadge tierLabel={tierLabel} />

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
                    {/* Position 1 Badge Removed - User requested usage of Position 2 only */}
                </div>

                <h3 className={`text-[15px] font-bold leading-tight line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {shop.title || shop.name}
                </h3>

                {/* Pay Info Logic */}
                <div className={`flex items-center gap-1.5 mt-0.5`}>
                    {/* Badge for Pay Type (Position 2: Fixed Badge, 1 Char) */}
                    <span className={`text-[10px] font-black px-1.5 py-[2px] rounded ${getPayColor(shop.payType || '시급')} whitespace-nowrap min-w-[24px] text-center`}>
                        {shop.payType?.substring(0, 1) || '시'}
                    </span>
                    {/* Pay Amount */}
                    <span className={`text-[13px] font-black tracking-tight ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {formatKoreanMoney(shop.pay)}
                    </span>
                </div>
            </div>

            {/* Footer Tags (Optional) - Hidden for now to match clean look or kept if exists */}
        </div>
    );
});
ShopCard.displayName = 'ShopCard';
