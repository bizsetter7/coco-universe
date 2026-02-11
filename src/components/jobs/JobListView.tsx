'use client';

import React from 'react';
import { Star, Flame, PlusCircle, Megaphone } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Shop } from '@/types/shop';
import { ICONS } from '@/constants/job-options';
import { formatKoreanMoney } from '@/utils/formatMoney';
import { getPayColor } from '@/utils/payColors';
import { formatDate } from '@/utils/dateUtils';

// Use Shop type directly
type Job = Shop;

interface Brand {
    theme: 'dark' | 'light';
    primaryColor?: string;
}

interface JobListViewProps {
    shops: Job[];
    brand: Brand;
    favorites: string[];
    toggleFavorite: (e: React.MouseEvent, id: string) => void;
    setSelectedShop: (shop: Job) => void;
    visibleCount: number;
    setVisibleCount: React.Dispatch<React.SetStateAction<number>>;
    onAdRegister?: (tier?: string) => void;
    onNativeAdRegister?: (tier?: string) => void;
}

// [Optimization] Helper for Pay Badge Logic (Pure function)
const getPayBadgeInfo = (shop: Shop) => {
    const payStr = shop.pay || '';
    let badgeLabel = '협';
    let badgeColor = 'bg-gray-400';
    let amount = payStr;

    const typeToCheck = shop.payType || payStr;

    if (typeToCheck.includes('TC')) {
        badgeLabel = 'T';
        badgeColor = 'bg-indigo-600';
    } else if (typeToCheck.includes('시급')) {
        badgeLabel = '시';
        badgeColor = 'bg-cyan-500';
    } else if (typeToCheck.includes('일급') || typeToCheck.includes('일')) {
        badgeLabel = '일';
        badgeColor = 'bg-blue-500';
    } else if (typeToCheck.includes('주급')) {
        badgeLabel = '주';
        badgeColor = 'bg-pink-500';
    } else if (typeToCheck.includes('월급') || typeToCheck.includes('월')) {
        badgeLabel = '월';
        badgeColor = 'bg-purple-500';
    } else if (typeToCheck.includes('연봉')) {
        badgeLabel = '연';
        badgeColor = 'bg-green-600';
    } else if (typeToCheck.includes('협의') || amount === '면접후결정') {
        badgeLabel = '협';
        badgeColor = 'bg-gray-400';
        amount = '면접후협의';
    }

    const cleanedAmount = typeof amount === 'string' ? amount.replace(/[^\d]/g, '') : String(amount);
    if (!isNaN(Number(cleanedAmount)) && cleanedAmount !== '') {
        amount = formatKoreanMoney(cleanedAmount);
    }

    return { badgeLabel, badgeColor, amount };
};

// [Optimization] Memoized Row Component
const JobRow = React.memo(({
    shop,
    isFav,
    brandTheme,
    onToggleFav,
    onSelect
}: {
    shop: Shop,
    isFav: boolean,
    brandTheme: 'dark' | 'light',
    onToggleFav: (e: React.MouseEvent, id: string) => void,
    onSelect: (shop: Shop) => void
}) => {
    const { badgeLabel, badgeColor, amount } = getPayBadgeInfo(shop);

    return (
        <tr
            onClick={() => onSelect(shop)}
            className={`transition-colors cursor-pointer group ${brandTheme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}
        >
            {/* 1. 지역 */}
            <td className="py-4 px-2 text-center whitespace-nowrap truncate">
                <span className={`text-[13px] font-bold ${brandTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    {shop.region.split(' ')[1] ? `[${shop.region.split(' ')[1]}]` : shop.region}
                </span>
            </td>

            {/* 2. 스크랩 */}
            <td className="py-4 px-2 text-center">
                <button onClick={(e) => onToggleFav(e, shop.id)} className={`transition-transform active:scale-90 ${isFav ? 'text-amber-400' : 'text-gray-200 group-hover:text-gray-300'}`}>
                    <Star size={18} fill={isFav ? "currentColor" : "none"} />
                </button>
            </td>

            {/* 3. 업소명 */}
            <td className="py-4 px-2 text-center">
                <div className="flex items-center justify-center gap-1.5 w-full">
                    <span className={`font-black text-[14px] truncate max-w-full ${brandTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                        {shop.name.replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, '').trim()}
                    </span>
                </div>
            </td>

            {/* 4. 직종 */}
            <td className="py-4 px-2 text-center">
                <span className="text-[13px] font-bold text-gray-500 truncate block">{shop.workType}</span>
            </td>

            {/* 5. 모집내용 */}
            <td className="py-4 px-2 text-center">
                <div className="flex items-center justify-center gap-2 w-full">
                    {shop.options?.blink && <span className="text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded font-black whitespace-nowrap shrink-0">NEW</span>}

                    <p className={`text-[14px] font-bold truncate max-w-[300px] ${brandTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {(shop.title || `${shop.name}에서 열정적인 가족을 모집합니다. 최고 대우 보장!`).replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, '').trim()}
                    </p>
                </div>
            </td>

            {/* 6. 급여 */}
            <td className="py-4 pr-4 pl-2 text-right">
                <div className="flex flex-col items-end justify-center w-full">
                    <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                        <span className={`${badgeColor} text-white text-[10px] w-[18px] h-[18px] flex items-center justify-center rounded-sm font-bold shadow-sm`}>{badgeLabel}</span>
                        <div className={`font-black text-[12px] tracking-tighter ${brandTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {amount}
                        </div>
                    </div>
                    {shop.options?.paySuffixes && shop.options.paySuffixes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 justify-end w-full">
                            {shop.options.paySuffixes.map((suffix, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[9px] rounded font-bold border border-gray-200">
                                    {suffix}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
});
JobRow.displayName = 'JobRow';

const getTierBadge = (tier?: string) => {
    switch (tier) {
        case 'special': return { label: '스페셜', color: 'bg-emerald-500 text-white' };
        case 'premium': return { label: '프리미엄', color: 'bg-purple-600 text-white' };
        case 'grand': return { label: '그랜드', color: 'bg-amber-400 text-black' };
        case 'deluxe': return { label: '디럭스', color: 'bg-pink-600 text-white' };
        case 'urgent': return { label: '급구', color: 'bg-red-600 text-white' };
        default: return null;
    }
};

// [Optimization] Memoized Mobile Row Component
const MobileJobRow = React.memo(({
    shop,
    isFav,
    brandTheme,
    onSelect,
    onToggleFav
}: {
    shop: Shop,
    isFav: boolean,
    brandTheme: 'dark' | 'light',
    onSelect: (shop: Shop) => void,
    onToggleFav: (e: React.MouseEvent, id: string) => void
}) => {
    const { badgeLabel, badgeColor, amount } = getPayBadgeInfo(shop);
    const tierInfo = getTierBadge(shop.tier);

    return (
        <div
            onClick={() => onSelect(shop)}
            className={`p-1 flex flex-col border-b last:border-0 relative !bg-white border-gray-100 shadow-sm shadow-gray-100`}
            style={{ mixBlendMode: 'normal' }}
        >
            <div className="w-full bg-white rounded-lg p-3 flex justify-between items-start gap-1 relative shadow-sm border border-gray-100">
                {/* Corner Badges (NEW ONLY) */}
                <div className="absolute top-1 left-1 flex flex-wrap gap-1 z-10 pointer-events-none">
                    {shop.options?.blink && <span className="text-[9px] bg-red-600 text-white px-1 py-0.5 rounded font-black whitespace-nowrap shadow-sm animate-pulse">NEW</span>}
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-1.5 pr-2 pt-1">
                    {/* Line 1: Title (광고내용) */}
                    <h3 className={`text-[15px] font-bold break-words line-clamp-1 !text-gray-900 force-dark-text`}>
                        <span className="truncate">{(shop.title || shop.name).replace(/\[.*?\]|\(.*?\)|\{.*?\}/g, '').trim()}</span>
                    </h3>

                    {/* Line 2: Icons + Region + WorkType */}
                    <div className="flex items-center gap-1.5 text-[12px] flex-wrap">
                        {shop.options?.icon && (() => {
                            const iconObj = ICONS.find(i => i.id === Number(shop.options?.icon));
                            return iconObj ? (
                                <span className="flex items-center gap-0.5 animate-in fade-in zoom-in duration-300">
                                    <span className="text-[11px]">{iconObj.icon}</span>
                                    <span className="text-[9px] font-black text-pink-500 tracking-tighter uppercase">{iconObj.name}</span>
                                </span>
                            ) : null;
                        })()}
                        <span className="text-blue-600 font-bold truncate max-w-[100px]">{shop.region}</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500 font-medium truncate">{shop.workType}</span>
                    </div>

                    {/* Line 3: Pay */}
                    <div className="flex items-center gap-1 mt-0.5">
                        <div className={`
                        px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold text-white
                        ${badgeColor}
                    `}>
                            {badgeLabel}
                        </div>
                        <div className={`text-[11px] font-black tracking-tighter !text-gray-900 force-dark-text`}>
                            {amount}
                        </div>
                        {shop.options?.paySuffixes?.map((suffix, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[9px] rounded font-bold border border-gray-200">
                                {suffix}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Right: Star Icon (Using Flexbox instead of Absolute) */}
                <button
                    onClick={(e) => onToggleFav(e, shop.id)}
                    className="p-1 shrink-0 text-gray-300 active:scale-90 transition-transform"
                >
                    <Star size={20} fill={isFav ? "currentColor" : "none"} className={isFav ? "text-amber-400" : ""} />
                </button>
            </div>
        </div>
    );
});
MobileJobRow.displayName = 'MobileJobRow';

const MobileNativeAd = React.memo(({
    onRegister,
    onNavigate
}: {
    onRegister?: (tier?: string) => void,
    onNavigate: () => void
}) => (
    <div className="p-3 bg-pink-50">
        <div className="bg-white/90 rounded-xl p-3 border border-pink-100 flex items-center justify-between">
            <div>
                <p className="text-[10px] text-pink-600 font-black mb-0.5">PREMIUM AD</p>
                <p className="text-[13px] font-bold text-gray-800">사장님, 여기보세요!</p>
            </div>
            <button
                onClick={() => onRegister ? onRegister('mobile_list') : onNavigate()}
                className="px-3 py-1.5 bg-pink-600 text-white text-[11px] font-bold rounded-lg shadow-sm"
            >
                광고등록
            </button>
        </div>
    </div>
));
MobileNativeAd.displayName = 'MobileNativeAd';

const JobListView: React.FC<JobListViewProps> = ({
    shops,
    brand,
    favorites,
    toggleFavorite,
    setSelectedShop,
    visibleCount,
    setVisibleCount,
    onAdRegister,
    onNativeAdRegister,
}) => {
    const router = useRouter();

    // [Optimization] DOM Culling Logic
    // Initially render BOTH (hidden by CSS) to prevent hydration mismatch.
    // After mount, remove the hidden one from DOM to save memory/cpu.
    const [isMounted, setIsMounted] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 768); // md breakpoint
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const showDesktop = !isMobile || !isMounted;
    const showMobile = isMobile || !isMounted;

    return (
        <div id="latest-job-info-region" className="w-full clear-both mt-0 px-4 md:px-0">
            <div className="flex items-center justify-between mb-5 w-full">
                <h2 className={`text-xl md:text-2xl font-black flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'} `}>
                    <Flame size={24} className="text-pink-600 animate-pulse" />
                    <span>최신 구인정보</span>
                    <span className="bg-pink-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse uppercase font-sans shadow-md">LIVE</span>
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        className="hidden md:flex items-center px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 transition shadow-sm"
                    >
                        <Star size={14} className="mr-1 text-amber-400" fill="currentColor" /> 내 보관함
                    </button>
                    <button
                        className="hidden md:flex items-center px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 transition shadow-sm"
                    >
                        더보기 +
                    </button>
                    <button
                        onClick={() => onAdRegister ? onAdRegister('basic') : router.push('/?page=payment')}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-pink-600 text-white hover:bg-pink-700 transition shadow-md hover:shadow-lg active:scale-95"
                    >
                        광고신청
                    </button>
                </div>
            </div>

            <div className={`rounded-2xl border shadow-sm overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                {/* Desktop Table View */}
                {showDesktop && (
                    <div className="hidden md:block overflow-hidden">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead className={`text-[13px] border-b ${brand.theme === 'dark' ? 'bg-gray-800/50 border-gray-700 text-gray-300' : 'bg-gray-50/80 border-gray-100 text-gray-500'}`}>
                                <tr>
                                    <th className="py-4 px-2 font-black whitespace-nowrap w-[10%] text-center">지역</th>
                                    <th className="py-4 px-2 font-black whitespace-nowrap w-[5%] text-center">찜</th>
                                    <th className="py-4 px-2 font-black whitespace-nowrap w-[15%] text-center">업소명</th>
                                    <th className="py-4 px-2 font-black whitespace-nowrap w-[10%] text-center">직종</th>
                                    <th className="py-4 px-2 font-black whitespace-nowrap w-[45%] text-center">모집내용</th>
                                    <th className="py-4 px-2 font-black whitespace-nowrap w-[15%] text-center">급여</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${brand.theme === 'dark' ? 'divide-gray-800' : 'divide-gray-50'}`}>
                                {shops.length > 0 ? (
                                    shops.slice(0, visibleCount).map((shop, i) => {
                                        const isFav = favorites.includes(shop.id);
                                        const isAdRow = (i + 1) % 5 === 0;

                                        return (
                                            <React.Fragment key={shop.id || i}>
                                                <JobRow
                                                    shop={shop}
                                                    isFav={isFav}
                                                    brandTheme={brand.theme}
                                                    onToggleFav={toggleFavorite}
                                                    onSelect={setSelectedShop}
                                                />

                                                {/* 광고 영역 (Native Ad) */}
                                                {isAdRow && (
                                                    <tr>
                                                        <td colSpan={6} className="p-4">
                                                            <div className="w-full bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100 flex items-center justify-between relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all">
                                                                <div className="relative z-10">
                                                                    <h4 className="text-[17px] font-black text-gray-900 mb-1 flex items-center gap-2">
                                                                        <Megaphone size={20} className="text-pink-600" />
                                                                        <span>사장님, 광고 한칸 어떠세요?</span>
                                                                    </h4>
                                                                    <p className="text-gray-500 text-xs font-medium">최고의 노출 효과로 매출을 UP 시켜보세요!</p>
                                                                </div>
                                                                <div className="relative z-10">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); onNativeAdRegister ? onNativeAdRegister('native') : (onAdRegister ? onAdRegister('native') : router.push('/?page=payment')); }}
                                                                        className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-1.5"
                                                                    >
                                                                        <PlusCircle size={16} /> 광고신청
                                                                    </button>
                                                                </div>
                                                                {/* Optimized Decor elements (Removed heavy blur) */}
                                                                <div className="absolute right-0 top-0 w-32 h-32 bg-pink-100/30 rounded-full -translate-y-1/2 translate-x-1/2" />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan={6} className="py-20 text-center text-gray-400 font-bold">결과가 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Mobile Ad-like View */}
                {showMobile && (
                    <div className="md:hidden">
                        <div className={`divide-y ${brand.theme === 'dark' ? 'divide-gray-800' : 'divide-gray-100'}`}>
                            {shops.length > 0 ? (
                                shops.slice(0, visibleCount).map((shop, i) => {
                                    const isFav = favorites.includes(shop.id);
                                    return (
                                        <React.Fragment key={shop.id || i}>
                                            <MobileJobRow
                                                shop={shop}
                                                isFav={isFav}
                                                brandTheme={brand.theme}
                                                onSelect={setSelectedShop}
                                                onToggleFav={toggleFavorite}
                                            />

                                            {/* Mobile Native Ad */}
                                            {(i + 1) % 5 === 0 && (
                                                <MobileNativeAd
                                                    onRegister={onNativeAdRegister}
                                                    onNavigate={() => router.push('/?page=payment')}
                                                />
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <div className="py-20 text-center text-gray-400 font-bold">
                                    결과가 없습니다.
                                </div>
                            )}
                        </div>

                        {/* View More Button */}
                        {shops.length >= visibleCount && (
                            <div className="p-4">
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 20)}
                                    className={`w-full py-3 rounded-xl font-bold border transition-all active:scale-95 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    더보기 +
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobListView;
