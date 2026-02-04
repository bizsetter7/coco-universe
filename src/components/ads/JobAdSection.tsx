'use client'; // Physical Surgical Update: 2026-02-04-14:40 (Pure FPS Engine Turn)

import React, { useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Crown, Zap, Flame, Sparkles } from 'lucide-react';
import { Shop } from '@/types/shop';
import { BrandConfig } from '@/lib/brand-config';

interface JobAdSectionProps {
    title: string;
    icon: React.ReactNode;
    shops: Shop[];
    limit: number;
    onMore?: () => void;
    tier: string;
    brand: BrandConfig;
    setSelectedShop: (shop: Shop) => void;
    showAdButton?: boolean;
    onAdRegister?: () => void;
    favorites?: string[];
    toggleFavorite?: (e: React.MouseEvent, id: string) => void;
}

interface TierStyle {
    bg: string;
    text: string;
    label: string;
    icon: React.ReactNode;
}

const tierConfig: Record<string, TierStyle> = {
    grand: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'GRAND', icon: <Crown size={18} className="text-amber-500" /> },
    premium: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'PREMIUM', icon: <Crown size={18} className="text-purple-500" /> },
    deluxe: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'DELUXE', icon: <Zap size={18} className="text-blue-500" /> },
    special: { bg: 'bg-teal-50', text: 'text-teal-600', label: 'SPECIAL', icon: <Sparkles size={18} className="text-teal-500" /> },
    urgent: { bg: 'bg-rose-50', text: 'text-rose-600', label: '급구', icon: <Flame size={18} className="text-rose-500" /> },
    recommended: { bg: 'bg-indigo-50', text: 'text-indigo-600', label: '추천', icon: <Sparkles size={18} className="text-indigo-500" /> },
};

const JobCardImage = ({ src, alt, priority }: { src: string, alt: string, priority: boolean }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <Image
            src={src}
            alt={alt}
            width={400}
            height={400}
            sizes="(max-width: 768px) 50vw, 33vw"
            quality={75}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ display: 'block' }}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            onLoad={() => setIsLoaded(true)}
        />
    );
};

const JobCard = React.memo(({
    shop,
    rank,
    isFav,
    tier,
    tierConfig,
    brand,
    setSelectedShop,
    toggleFavorite
}: {
    shop: Shop;
    rank: number;
    isFav: boolean;
    tier: string;
    tierConfig: Record<string, TierStyle>;
    brand: BrandConfig;
    setSelectedShop: (shop: Shop) => void;
    toggleFavorite: (e: React.MouseEvent, id: string) => void;
}) => {
    let displayTier = tier;
    if (tier === 'auto') {
        displayTier = shop.tier && tierConfig[shop.tier] ? shop.tier : 'grand';
    } else if (tier === 'urgent') {
        // rank is 1-based index
        displayTier = (rank - 1) % 2 === 0 ? 'urgent' : 'recommended';
    }

    const tileConfig = tierConfig[displayTier] || tierConfig.grand;

    const renderFallback = () => (
        <div className={`w-full aspect-square ${tileConfig.bg} flex items-center justify-center p-4 text-center overflow-hidden relative min-h-[140px] md:min-h-[200px]`}>
            <div>{tileConfig.icon}</div>
        </div>
    );

    return (
        <div
            onClick={() => startTransition(() => setSelectedShop(shop))}
            className={`
                cursor-pointer group block relative bg-white rounded-xl overflow-hidden duration-300
                border ${brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}
                border-b-2 hover:border-b-4 active:border-b-2
                ad-card max-width-full
            `}
            style={{
                contain: 'content',
                // Physical Surgical Update: Removed heavy GPU hacks (translate3d) to save VRAM
            }}
        >
            <div className="flex flex-col">
                <div
                    className="relative w-full aspect-square overflow-hidden bg-[#f8f9fa]"
                    style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1 / 1',
                        overflow: 'hidden',
                        backgroundColor: '#f8f9fa',
                        willChange: 'transform' // Localized hardware acceleration for smooth image appearing
                    }}
                >
                    {shop.options?.mediaUrl ? (
                        <>
                            <JobCardImage
                                src={shop.options.mediaUrl}
                                alt={shop.name}
                                priority={rank <= 4}
                            />
                            <div className="hidden absolute inset-0 w-full h-full">
                                {renderFallback()}
                            </div>
                        </>
                    ) : (
                        renderFallback()
                    )}

                    {shop.tier && shop.tier !== 'common' && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded text-[10px] text-white font-bold tracking-tight">
                            {tierConfig[shop.tier]?.label || shop.tier.toUpperCase()}
                        </div>
                    )}
                </div>

                {/* BOTTOM: Info Section */}
                <div className="p-3 mt-3">
                    <div className="mb-2 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-0">
                            <h4 className={`text-[14px] font-black truncate leading-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'} max-w-[80%]`}>
                                {shop.realName || shop.name}
                            </h4>
                            <span className="text-[10px] text-gray-400 font-medium shrink-0 ml-1">
                                {rank}위
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
                            {shop.region}
                        </p>
                    </div>

                    {(() => {
                        const payStr = shop.pay || '';
                        let badgeLabel = '협';
                        let badgeColor = 'bg-gray-400';
                        let amount = payStr;
                        const typeToCheck = shop.payType || payStr;

                        if (typeToCheck.includes('TC')) { badgeLabel = 'T'; badgeColor = 'bg-indigo-600'; }
                        else if (typeToCheck.includes('시급')) { badgeLabel = '시'; badgeColor = 'bg-cyan-500'; }
                        else if (typeToCheck.includes('일급') || typeToCheck.includes('일')) { badgeLabel = '일'; badgeColor = 'bg-blue-500'; }
                        else if (typeToCheck.includes('주급')) { badgeLabel = '주'; badgeColor = 'bg-pink-500'; }
                        else if (typeToCheck.includes('월급') || typeToCheck.includes('월')) { badgeLabel = '월'; badgeColor = 'bg-purple-500'; }
                        else if (typeToCheck.includes('연봉')) { badgeLabel = '연'; badgeColor = 'bg-green-600'; }

                        if (!isNaN(Number(amount))) amount = Number(amount).toLocaleString();

                        return (
                            <div className="flex flex-col gap-1 h-[46px] justify-start">
                                <div className="flex items-center gap-1.5 font-bold">
                                    <span className={`${badgeColor} text-white text-[10px] w-[16px] h-[16px] flex items-center justify-center rounded-[4px] font-bold shadow-sm shrink-0`}>
                                        {badgeLabel}
                                    </span>
                                    <span className={`text-[14px] font-black tracking-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {amount}{!isNaN(Number(shop.pay)) ? <span className="text-[11px] font-normal ml-0.5 text-gray-500">원</span> : ''}
                                    </span>
                                </div>
                                {shop.options?.paySuffixes && shop.options.paySuffixes.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-0.5 overflow-hidden h-[20px]">
                                        {shop.options.paySuffixes.slice(0, 3).map((suffix: string, i: number) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[9px] rounded font-bold border border-gray-200 whitespace-nowrap">
                                                {suffix}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                    <div className="flex items-center justify-end mt-1">
                        <button
                            onClick={(e) => toggleFavorite(e, shop.id)}
                            className={`transition-colors ${isFav ? 'text-pink-500' : 'text-gray-300 hover:text-pink-400'}`}
                        >
                            <Crown size={14} fill={isFav ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.shop.id === nextProps.shop.id &&
        prevProps.isFav === nextProps.isFav &&
        prevProps.rank === nextProps.rank &&
        prevProps.brand.theme === nextProps.brand.theme &&
        prevProps.tier === nextProps.tier
    );
});

const JobAdSection = ({
    title,
    icon,
    shops,
    limit,
    onMore,
    tier,
    brand,
    setSelectedShop,
    showAdButton = true,
    onAdRegister,
    favorites = [],
    toggleFavorite = () => { }
}: JobAdSectionProps) => {
    const router = useRouter();

    console.log(`%c[JobAdSection Debug - ${title}]`, "color: #ff0080; font-weight: bold", "Data reached UI! total shops:", shops.length, "limit:", limit);

    return (
        <div className="mb-0">
            <div className="flex items-center justify-between mb-4 px-4 md:px-0">
                <h3 className={`text-lg md:text-xl font-black flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {icon}
                    {title}
                </h3>
                <div className="flex gap-2">
                    {onMore && shops.length > limit && (
                        <button
                            onClick={onMore}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            더보기 +
                        </button>
                    )}
                    {showAdButton && (
                        <button
                            onClick={() => onAdRegister ? onAdRegister() : router.push('/?page=payment')}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-pink-600 text-white hover:bg-pink-700 transition"
                        >
                            광고신청
                        </button>
                    )}
                </div>
            </div>

            <div className="px-4 md:px-0">
                <div
                    className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
                    style={{
                        contentVisibility: 'auto',
                        containIntrinsicSize: '300px'
                    }}
                >
                    {shops.slice(0, limit).map((shop, idx) => (
                        <JobCard
                            key={shop.id || idx}
                            shop={shop}
                            rank={idx + 1}
                            isFav={favorites?.includes(shop.id) ?? false}
                            tier={tier}
                            tierConfig={tierConfig}
                            brand={brand}
                            setSelectedShop={setSelectedShop}
                            toggleFavorite={toggleFavorite}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default JobAdSection;
