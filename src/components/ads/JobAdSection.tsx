import React from 'react';
import { Crown, Star, Gem, Trophy, Flame, Siren } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Shop } from '@/types/shop';

// Use Shop type directly
type Job = Shop;

interface Brand {
    theme: 'dark' | 'light';
}

interface JobAdSectionProps {
    title: string;
    icon?: React.ReactNode;
    shops: Job[];
    limit: number;
    onMore?: () => void;
    tier: 'grand' | 'premium' | 'deluxe' | 'special' | 'urgent' | 'recommended' | 'auto' | 'native' | 'common' | 'basic';
    brand: Brand;
    setSelectedShop: (shop: Job) => void;
    showAdButton?: boolean;
    onAdRegister?: () => void;
    favorites?: string[];
    toggleFavorite?: (e: React.MouseEvent, id: string) => void;
    cols?: number;
}

const JobAdSection: React.FC<JobAdSectionProps> = ({
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
    toggleFavorite,
    cols = 4,
}) => {
    const router = useRouter();

    if (shops.length === 0) return null;

    // Tier-specific styling configuration
    const tierConfig: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
        grand: {
            bg: 'bg-gradient-to-r from-amber-500 to-yellow-400',
            text: 'text-white',
            label: '그랜드',
            icon: <Crown className="text-white/50" size={32} />
        },
        premium: {
            bg: 'bg-gradient-to-r from-purple-600 to-pink-500',
            text: 'text-white',
            label: '프리미엄',
            icon: <Crown className="text-white/50" size={32} />
        },
        deluxe: {
            bg: 'bg-gradient-to-r from-blue-500 to-cyan-400',
            text: 'text-white',
            label: '디럭스',
            icon: <Gem className="text-white/50" size={32} />
        },
        special: {
            bg: 'bg-gradient-to-r from-emerald-500 to-teal-400',
            text: 'text-white',
            label: '스페셜',
            icon: <Trophy className="text-white/50" size={32} />
        },
        urgent: {
            bg: 'bg-gradient-to-r from-rose-500 to-orange-400',
            text: 'text-white',
            label: '급구',
            icon: <Siren className="text-white/50" size={32} />
        },
        recommended: {
            bg: 'bg-gradient-to-r from-indigo-500 to-violet-400',
            text: 'text-white',
            label: '추천',
            icon: <Flame className="text-white/50" size={32} />
        }
    };

    const config = tier === 'auto' ? tierConfig.grand : (tierConfig[tier] || tierConfig.grand);

    // Grid Column Class Logic
    const gridColsClass = cols === 2
        ? 'grid-cols-2 md:grid-cols-2'
        : 'grid-cols-2 md:grid-cols-4';

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg md:text-xl font-black flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
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

            <div className="ad-card-container">
                {shops.slice(0, limit).map((shop, idx) => {
                    // Calculate a consistent random view count based on name
                    const views = (shop.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 451) + 50;
                    const rank = idx + 1;
                    const isFav = favorites.includes(shop.id);

                    // Determine tier to display
                    let displayTier = tier;
                    if (tier === 'auto') {
                        // If auto, rely on the shop's own tier
                        // If shop.tier is invalid or missing, fallback to 'grand' or logic
                        displayTier = shop.tier && tierConfig[shop.tier] ? shop.tier : 'grand';
                    } else if (tier === 'urgent') {
                        // Urgent Tier: Alternate between Urgent and Recommended
                        displayTier = idx % 2 === 0 ? 'urgent' : 'recommended';
                    }

                    const tileConfig = tierConfig[displayTier] || tierConfig.grand;

                    // Fallback Render Helper
                    const renderFallback = (isHidden = false) => {
                        return (
                            <div className={`w-full h-full ${tileConfig.bg} flex items-center justify-center p-4 text-center overflow-hidden relative ${isHidden ? 'hidden' : ''}`}>
                                <div>
                                    {tileConfig.icon}
                                </div>
                            </div>
                        );
                    };

                    return (
                        <div
                            key={shop.id || idx}
                            onClick={() => setSelectedShop(shop)}
                            className={`
                                cursor-pointer group block relative bg-white rounded-[24px] overflow-hidden transition-all duration-300
                                border ${brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}
                                shadow-sm hover:shadow-md ad-card
                            `}
                        >
                            <div className="flex flex-col h-full">
                                {/* 상단: 이미지 또는 배너 영역 */}
                                <div className="relative h-[150px] w-full bg-slate-100 overflow-hidden">
                                    {shop.options?.mediaUrl ? (
                                        <>
                                            <img
                                                src={shop.options.mediaUrl}
                                                alt={shop.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                loading="eager"
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    const fallback = target.nextElementSibling;
                                                    if (fallback) {
                                                        target.style.display = 'none';
                                                        fallback.classList.remove('hidden');
                                                        fallback.classList.add('flex');
                                                    }
                                                }}
                                            />
                                            {/* Fallback if image fails */}
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
                                <div className="p-3">
                                    {/* Name & Region Container with Fixed Height */}
                                    <div className="h-[44px] mb-2 flex flex-col justify-between">
                                        {/* Row 1: Name */}
                                        <div className="flex justify-between items-start mb-0">
                                            <h4 className={`text-[14px] font-black truncate leading-tight ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'} max-w-[80%]`}>
                                                {shop.realName || shop.name}
                                            </h4>
                                            <span className="text-[10px] text-gray-400 font-medium shrink-0 ml-1">
                                                {rank}위
                                            </span>
                                        </div>

                                        {/* Row 2: Region */}
                                        <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
                                            {shop.region}
                                        </p>
                                    </div>

                                    {/* Row 3: Pay Logic */}
                                    {(() => {
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
                                        }

                                        if (!isNaN(Number(amount))) {
                                            amount = Number(amount).toLocaleString();
                                        }

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
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default JobAdSection;
