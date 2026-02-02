import React from 'react';
import { MapPin, Star, Flame, Gift, ArrowUp, PlusCircle, Megaphone } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Shop } from '@/types/shop';

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
    onAdRegister?: () => void;
    onNativeAdRegister?: () => void;
}

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
                        onClick={() => onAdRegister ? onAdRegister() : router.push('/?page=payment')}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-pink-600 text-white hover:bg-pink-700 transition shadow-md hover:shadow-lg active:scale-95"
                    >
                        광고신청
                    </button>
                </div>
            </div>

            <div className={`rounded-2xl border shadow-sm overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                {/* Desktop Table View */}
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
                                    return (
                                        <React.Fragment key={shop.id || i}>
                                            <tr
                                                onClick={() => setSelectedShop(shop)}
                                                className={`transition-all cursor-pointer group hover:-translate-y-0.5 ${brand.theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-white hover:shadow-lg hover:shadow-gray-100/50'}`}
                                            >
                                                {/* 1. 지역 */}
                                                <td className="py-4 px-2 text-center whitespace-nowrap truncate">
                                                    <span className={`text-[13px] font-bold ${brand.theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                                                        {shop.region.split(' ')[1] ? `[${shop.region.split(' ')[1]}]` : shop.region}
                                                    </span>
                                                </td>

                                                {/* 2. 스크랩 */}
                                                <td className="py-4 px-2 text-center">
                                                    <button onClick={(e) => toggleFavorite(e, shop.id)} className={`transition-transform active:scale-90 ${isFav ? 'text-amber-400' : 'text-gray-200 group-hover:text-gray-300'}`}>
                                                        <Star size={18} fill={isFav ? "currentColor" : "none"} />
                                                    </button>
                                                </td>

                                                {/* 3. 업소명 */}
                                                <td className="py-4 px-2 text-center">
                                                    <div className="flex items-center justify-center gap-1.5 w-full">
                                                        <span className={`font-black text-[14px] truncate max-w-full ${brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                                                            {shop.name}
                                                        </span>
                                                        {shop.tier && shop.tier !== 'common' && (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                                        )}
                                                    </div>
                                                </td>

                                                {/* 4. 직종 */}
                                                <td className="py-4 px-2 text-center">
                                                    <span className="text-[13px] font-bold text-gray-500 truncate block">{shop.workType}</span>
                                                </td>

                                                {/* 5. 모집내용 (Centered) */}
                                                <td className="py-4 px-2 text-center">
                                                    <div className="flex items-center justify-center gap-2 w-full">
                                                        {shop.options?.blink && <span className="text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded font-black whitespace-nowrap shrink-0">NEW</span>}
                                                        {shop.tier === 'urgent' && <span className="text-[10px] bg-rose-100 text-rose-600 px-1 py-0.5 rounded font-black whitespace-nowrap shrink-0">급구</span>}

                                                        <p className={`text-[14px] font-bold truncate max-w-[300px] ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            {shop.title || `${shop.name}에서 열정적인 가족을 모집합니다. 최고 대우 보장!`}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* 6. 급여 (New Column - Right Aligned to match Ad Box) */}
                                                <td className="py-4 pr-4 pl-2 text-right">
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
                                                            amount = '면접후협의';
                                                        }

                                                        if (!isNaN(Number(amount))) {
                                                            amount = Number(amount).toLocaleString();
                                                        }

                                                        return (
                                                            <div className="flex flex-col items-end justify-center w-full">
                                                                <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                                                                    <span className={`${badgeColor} text-white text-[10px] w-[18px] h-[18px] flex items-center justify-center rounded-sm font-bold shadow-sm`}>{badgeLabel}</span>
                                                                    <span className={`font-black text-[15px] ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                                        {amount}{!isNaN(Number(shop.pay)) && Number(shop.pay) > 0 ? <span className="text-[11px] font-normal ml-0.5 text-gray-500">원</span> : ''}
                                                                    </span>
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
                                                        );
                                                    })()}
                                                </td>
                                            </tr>

                                            {/* 광고 영역 */}
                                            {(i + 1) % 3 === 0 && (
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
                                                                    onClick={(e) => { e.stopPropagation(); onNativeAdRegister ? onNativeAdRegister() : (onAdRegister ? onAdRegister() : router.push('/?page=payment')); }}
                                                                    className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-1.5"
                                                                >
                                                                    <PlusCircle size={16} /> 광고신청
                                                                </button>
                                                            </div>
                                                            {/* Decor elements */}
                                                            <div className="absolute right-0 top-0 w-32 h-32 bg-pink-100/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
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

                {/* Mobile FoxAlba Style List View */}
                <div className="md:hidden">
                    <div className={`divide-y ${brand.theme === 'dark' ? 'divide-gray-800' : 'divide-gray-100'}`}>
                        {shops.length > 0 ? (
                            shops.slice(0, visibleCount).map((shop, i) => {
                                const isFav = favorites.includes(shop.id);
                                return (
                                    <React.Fragment key={shop.id || i}>
                                        <div
                                            onClick={() => setSelectedShop(shop)}
                                            className={`p-4 active:bg-gray-50 transition-colors flex justify-between items-start gap-3 ad-card ${brand.theme === 'dark' ? 'bg-gray-900 active:bg-gray-800' : 'bg-white'}`}
                                        >
                                            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                                {/* Line 1: Title (광고내용) */}
                                                <h3 className={`text-[15px] font-bold break-keep line-clamp-1 truncate flex items-center gap-1.5 ${brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        {shop.options?.blink && <span className="text-[9px] bg-red-100 text-red-600 px-1 py-0.5 rounded font-black whitespace-nowrap">NEW</span>}
                                                        {shop.tier === 'urgent' && <span className="text-[9px] bg-rose-100 text-rose-600 px-1 py-0.5 rounded font-black whitespace-nowrap">급구</span>}
                                                    </div>
                                                    <span>{shop.title || `${shop.name}에서 함께 일할 가족을 모집합니다.`}</span>
                                                </h3>

                                                {/* Line 2: Metadata (Ad Type / Name / Region / Work Type) */}
                                                <div className="flex items-center gap-1.5 text-[12px] opacity-90 flex-wrap leading-tight">
                                                    {shop.tier && shop.tier !== 'common' && (
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 font-sans ${shop.tier === 'grand' ? 'bg-amber-100 text-amber-600' : shop.tier === 'special' ? 'bg-purple-100 text-purple-600' : shop.tier === 'premium' ? 'bg-blue-100 text-blue-600' : shop.tier === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                            {shop.tier === 'grand' ? '그랜드' : shop.tier === 'premium' ? '프리미엄' : shop.tier === 'deluxe' ? '디럭스' : shop.tier === 'special' ? '스페셜' : shop.tier === 'urgent' ? '급구' : shop.tier === 'recommended' ? '추천' : shop.tier === 'native' ? '네이티브' : '일반'}
                                                        </span>
                                                    )}
                                                    <span className="text-blue-500 font-extrabold truncate max-w-[140px]">
                                                        {shop.realName || shop.name}
                                                    </span>
                                                    <span className="text-gray-300 mx-0.5">/</span>
                                                    <span className="text-amber-700 font-bold">{shop.region.split(' ').slice(0, 2).join(' ')}</span>
                                                    <span className="text-gray-300 mx-0.5">/</span>
                                                    <span className="text-emerald-600 font-bold">{shop.workType}</span>
                                                </div>

                                                {/* Line 3: Pay + Tags */}
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
                                                        amount = '면접후협의';
                                                    }

                                                    if (!isNaN(Number(amount))) {
                                                        amount = Number(amount).toLocaleString();
                                                    }

                                                    return (
                                                        <div className="flex items-center flex-wrap gap-2 pt-0.5">
                                                            <div className="flex items-center gap-1.5 font-bold">
                                                                <span className={`${badgeColor} text-white text-[10px] w-[15px] h-[15px] flex items-center justify-center rounded-[3px] uppercase font-sans leading-none shadow-sm`}>{badgeLabel}</span>
                                                                <span className={`${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'} text-[13px] font-black tracking-tight`}>
                                                                    {amount}{!isNaN(Number(shop.pay)) && Number(shop.pay) > 0 ? <span className="text-[10px] font-normal ml-0.5 text-gray-500">원</span> : ''}
                                                                </span>
                                                            </div>
                                                            {shop.options?.paySuffixes && shop.options.paySuffixes.length > 0 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {shop.options.paySuffixes.slice(0, 3).map((suffix, i) => (
                                                                        <span key={i} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 text-[9px] rounded border border-gray-100 leading-none font-bold">
                                                                            {suffix}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <button onClick={(e) => toggleFavorite(e, shop.id)} className={`p-1 transition-all ${isFav ? 'text-amber-400' : 'text-gray-200'}`}>
                                                    <Star size={22} fill={isFav ? "currentColor" : "none"} />
                                                </button>
                                            </div>
                                        </div>
                                        {/* 네이티브 광고 (모바일 - 3의 배수마다) */}
                                        {(i + 1) % 3 === 0 && i !== shops.length - 1 && (
                                            <div className="p-4 border-b border-gray-100">
                                                <div className="p-4 rounded-xl border-2 border-dashed border-pink-300 bg-pink-50/50 flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-[14px] font-black text-black mb-0.5 flex items-center gap-1.5">
                                                            <Megaphone size={16} className="text-pink-600" />
                                                            <span>사장님, 광고 한칸 어떠세요?</span>
                                                        </h4>
                                                        <p className="text-[10px] text-gray-500 pl-6">매출 UP 효과 보장!</p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onNativeAdRegister ? onNativeAdRegister() : (onAdRegister ? onAdRegister() : router.push('/?page=payment')); }}
                                                        className="px-3 py-1.5 bg-pink-600 text-white rounded-lg text-xs font-bold hover:bg-pink-700 transition"
                                                    >
                                                        광고신청
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <div className="py-20 text-center text-gray-400">등록된 공고가 없습니다.</div>
                        )}
                    </div>
                </div>
            </div>

            {visibleCount < shops.length && (
                <button
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    className="w-full mt-6 py-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                    공고 더보기 ({shops.length - visibleCount}개 남음)
                </button>
            )}

            {shops.length === 0 && (
                <div className="text-center py-20 text-gray-400 text-sm">
                    해당 지역의 공고가 없습니다.
                </div>
            )}
        </div>
    );
};

export default JobListView;
