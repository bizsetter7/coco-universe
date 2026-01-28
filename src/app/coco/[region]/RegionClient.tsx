'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, MapPin, Phone, MessageSquare, TrendingUp, Sparkles, Home, Star, ChevronRight, X, MessageCircle } from 'lucide-react';

interface Shop {
    name: string;
    region: string;
    phone: string;
    kakao: string;
    telegram: string;
    pay: string;
    workType: string;
    url: string;
    site: string;
    id: string;
    is_placeholder: boolean;
    is_premium?: boolean;
    is_verified?: boolean;
    tier?: 'grand' | 'preferential' | 'premium' | 'special' | 'urgent' | 'recommended' | 'common';
}

interface RegionClientProps {
    regionName: string;
    shops: Shop[];
    brand: any;
}

export default function RegionClient({ regionName, shops, brand }: RegionClientProps) {
    const [visibleCount, setVisibleCount] = useState(10);
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [favorites, setFavorites] = useState<string[]>([]);

    // Load favorites from localStorage
    React.useEffect(() => {
        const saved = localStorage.getItem('coco-favorites');
        if (saved) setFavorites(JSON.parse(saved));
    }, []);

    const toggleFavorite = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newFavorites = favorites.includes(id)
            ? favorites.filter(fav => fav !== id)
            : [...favorites, id];
        setFavorites(newFavorites);
        localStorage.setItem('coco-favorites', JSON.stringify(newFavorites));
    };
    const sortedShops = [...shops].sort((a, b) => {
        const tierOrder = {
            'grand': 7,
            'preferential': 6,
            'premium': 5,
            'special': 4,
            'urgent': 3,
            'recommended': 2,
            'common': 1
        };
        const tierA = tierOrder[a.tier as keyof typeof tierOrder] || 0;
        const tierB = tierOrder[b.tier as keyof typeof tierOrder] || 0;

        if (tierA !== tierB) return tierB - tierA;
        if (a.is_verified && !b.is_verified) return -1;
        if (!a.is_verified && b.is_verified) return 1;
        return 0;
    });

    return (
        <div className={`min-h-screen pb-20 ${brand.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header */}
            <header className={`sticky top-0 z-50 border-b ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="max-w-4xl mx-auto px-3 h-14 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-1 text-pink-500 font-black">
                        <Home size={20} />
                        <span>COCOALBA</span>
                    </Link>
                    <div className={`text-sm font-black ${brand.theme === 'dark' ? 'text-gray-100' : 'text-black'}`}>{regionName} 실시간 현황</div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-3 py-8">
                {/* Hero Section */}
                <section className="mb-10 text-center py-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl text-white shadow-xl shadow-rose-200">
                    <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold mb-4">
                        AI 기반 최적 매칭 시스템 가동 중
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                        {regionName} 지역<br />
                        실시간 구인 공고 TOP
                    </h1>
                    <p className="text-pink-100 text-sm opacity-90">
                        {regionName}에서 검증된 우수 업소 {shops.length}곳이<br />
                        당신의 가능성을 기다리고 있습니다.
                    </p>
                </section>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className={`p-4 rounded-2xl shadow-sm border flex items-center gap-3 ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold">일일 조회수</p>
                            <p className={`text-lg font-black ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>1,240+</p>
                        </div>
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm border flex items-center gap-3 ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                        <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-bold">진행 중인 공고</p>
                            <p className={`text-lg font-black ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>{shops.length}개</p>
                        </div>
                    </div>
                </div>

                <div className="mt-1 mb-5 flex items-center justify-between w-full">
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <MapPin size={22} className="text-blue-500" />
                        <span>{regionName} 추천 업소</span>
                        <span className="bg-amber-100 text-amber-600 text-[9px] px-2 py-0.5 rounded-full font-black animate-pulse">AD OPEN</span>
                    </h2>
                    <div className="flex items-center gap-4 pr-8">
                        <Link href="/favorites" className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:underline">
                            <Star size={14} fill="currentColor" />
                            내 보관함
                        </Link>
                        <span className={`text-xs font-bold ${brand.theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>인기순</span>
                    </div>
                </div>

                <div className={`rounded-2xl border shadow-sm ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-hidden min-w-0">
                        <table className="w-full text-left text-sm border-collapse table-fixed">
                            <thead className={`border-b ${brand.theme === 'dark' ? 'bg-gray-900/80 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                <tr>
                                    <th className="w-[80px] px-3 py-3.5 font-black text-gray-500 whitespace-nowrap text-center">지역</th>
                                    <th className="w-[70px] px-3 py-3.5 font-black text-gray-500 whitespace-nowrap text-center">스크랩</th>
                                    <th className="w-[180px] px-3 py-3.5 font-black text-gray-500 whitespace-nowrap text-center">업소명</th>
                                    <th className="w-[100px] px-3 py-3.5 font-black text-gray-500 whitespace-nowrap text-center">직종</th>
                                    <th className="px-3 py-3.5 font-black text-gray-500 text-center">모집내용</th>
                                    <th className="w-[130px] px-3 py-3.5 font-black text-gray-500 text-center whitespace-nowrap pr-[31px]">급여</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${brand.theme === 'dark' ? 'divide-gray-800' : 'divide-gray-50'}`}>
                                {sortedShops.length > 0 ? (
                                    sortedShops.slice(0, visibleCount).map((shop, i) => {
                                        const isFav = favorites.includes(shop.id);
                                        return (
                                            <React.Fragment key={shop.id || i}>
                                                <tr
                                                    onClick={() => setSelectedShop(shop)}
                                                    className={`transition-colors cursor-pointer group ${brand.theme === 'dark' ? 'hover:bg-rose-900/10' : 'hover:bg-rose-50/50'}`}
                                                >
                                                    <td className="px-3 py-4 whitespace-nowrap text-center">
                                                        <span className="text-blue-600 font-extrabold">{shop.region.split(' ').slice(0, 2).join(' ')}</span>
                                                    </td>
                                                    <td className="px-3 py-4 text-center">
                                                        <button onClick={(e) => toggleFavorite(e, shop.id)} className={`transition-all hover:scale-125 ${isFav ? 'text-amber-400' : 'text-gray-300'}`}>
                                                            <Star size={18} fill={isFav ? "currentColor" : "none"} />
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-4">
                                                        <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                                                            {shop.tier && shop.tier !== 'common' && (
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${shop.tier === 'grand' ? 'bg-amber-100 text-amber-600 border border-amber-200' : shop.tier === 'special' ? 'bg-purple-100 text-purple-600 border border-purple-200' : shop.tier === 'premium' ? 'bg-blue-100 text-blue-600 border border-blue-200' : shop.tier === 'urgent' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-600'}`}>
                                                                    {shop.tier === 'grand' ? '그랜드' : shop.tier === 'special' ? '스페셜' : shop.tier === 'premium' ? '프리미엄' : shop.tier === 'urgent' ? '급구' : shop.tier === 'preferential' ? '우대' : shop.tier === 'recommended' ? '추천' : '일반'}
                                                                </span>
                                                            )}
                                                            <div className={`font-black w-full truncate group-hover:text-rose-600 transition-colors ${brand.theme === 'dark' ? 'text-gray-100' : 'text-black'}`}>
                                                                {shop.name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-4 text-gray-500 font-bold whitespace-nowrap text-center">{shop.workType}</td>
                                                    <td className="px-3 py-4 overflow-hidden">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <span className="text-red-500 text-[10px] font-black shrink-0 underline decoration-double">"NEW"</span>
                                                            {shop.tier === 'urgent' && <span className="bg-red-500 text-white text-[9px] px-1 rounded-sm font-black shrink-0">급구</span>}
                                                            <span className={`truncate font-bold ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                {shop.name}에서 함께 일할 가족을 모집합니다.
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-4 text-right pr-[31px]">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {(() => {
                                                                const payStr = shop.pay || '';
                                                                let badgeLabel = '협의';
                                                                let badgeColor = 'bg-gray-400';
                                                                let amount = payStr;

                                                                if (payStr.includes('TC') || payStr.includes('시급')) {
                                                                    badgeLabel = '시급';
                                                                    badgeColor = 'bg-indigo-400';
                                                                    amount = payStr.replace('TC', '').trim();
                                                                } else if (payStr.includes('일') || payStr.includes('당일')) {
                                                                    badgeLabel = '당일';
                                                                    badgeColor = 'bg-cyan-400';
                                                                    amount = payStr.replace('일', '').trim();
                                                                } else if (payStr.includes('주급')) {
                                                                    badgeLabel = '주급';
                                                                    badgeColor = 'bg-pink-400';
                                                                    amount = payStr.replace('주급', '').trim();
                                                                } else if (payStr.includes('월')) {
                                                                    badgeLabel = '월급';
                                                                    badgeColor = 'bg-purple-400';
                                                                    amount = payStr.replace('월', '').trim();
                                                                } else if (payStr.includes('협의')) {
                                                                    badgeLabel = '협의';
                                                                    badgeColor = 'bg-gray-400';
                                                                    amount = '면접후협의';
                                                                }

                                                                return (
                                                                    <>
                                                                        <span className={`${badgeColor} text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm shrink-0 uppercase`}>
                                                                            {badgeLabel}
                                                                        </span>
                                                                        <span className={`font-black whitespace-nowrap text-[14px] ${brand.theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                                                                            {amount}
                                                                        </span>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </td>
                                                </tr>
                                                {(i + 1) % 3 === 0 && (
                                                    <tr className="bg-amber-50/50 border-y border-amber-100">
                                                        <td colSpan={6} className="pl-6 py-5 pr-[31px]">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-amber-200">
                                                                        AD
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-[15px] font-black text-gray-900 mb-0.5">사장님, 광고 한칸 어떠세요?</h4>
                                                                        <p className="text-xs text-amber-600 font-bold">합리적인 비용으로 최고의 효율을 선사합니다.</p>
                                                                    </div>
                                                                </div>
                                                                <Link href="/my-shop" className="px-6 py-3 bg-gray-900 text-white text-xs font-black rounded-xl hover:bg-black transition-all active:scale-95">
                                                                    광고 신청하기
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan={6} className="py-20 text-center text-gray-400">등록된 공고가 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile FoxAlba Style List View */}
                    <div className="md:hidden">
                        <div className={`divide-y ${brand.theme === 'dark' ? 'divide-gray-800' : 'divide-gray-100'}`}>
                            {sortedShops.length > 0 ? (
                                sortedShops.slice(0, visibleCount).map((shop, i) => {
                                    const isFav = favorites.includes(shop.id);
                                    return (
                                        <React.Fragment key={shop.id || i}>
                                            <div
                                                onClick={() => setSelectedShop(shop)}
                                                className={`p-4 active:bg-gray-50 transition-colors flex justify-between items-start gap-3 ${brand.theme === 'dark' ? 'bg-gray-900 active:bg-gray-800' : 'bg-white'}`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`text-[15px] font-bold mb-1.5 break-keep line-clamp-1 truncate ${brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                                                        {shop.tier === 'urgent' && <span className="text-red-500 mr-1">♥</span>}
                                                        {shop.name}에서 함께 일할 가족을 모집합니다.
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-[12px] flex-wrap">
                                                        {shop.tier && shop.tier !== 'common' && (
                                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${shop.tier === 'grand' ? 'bg-amber-100 text-amber-600' : shop.tier === 'special' ? 'bg-purple-100 text-purple-600' : shop.tier === 'premium' ? 'bg-blue-100 text-blue-600' : shop.tier === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                                {shop.tier === 'grand' ? '그랜드' : shop.tier === 'special' ? '스페셜' : shop.tier === 'premium' ? '프리미엄' : shop.tier === 'urgent' ? '급구' : shop.tier === 'preferential' ? '우대' : shop.tier === 'recommended' ? '추천' : '일반'}
                                                            </span>
                                                        )}
                                                        <span className="text-blue-500 font-extrabold truncate max-w-[120px] flex items-center gap-0.5">
                                                            {shop.tier === 'urgent' ? '▶' : '♥'}{shop.name}{shop.tier === 'urgent' ? '◀' : '♥'}
                                                        </span>
                                                        <span className="text-gray-300">|</span>
                                                        <span className="text-amber-700 font-bold">{shop.region.split(' ').slice(0, 2).join(' ')}</span>
                                                        <span className="text-gray-300">|</span>
                                                        {(() => {
                                                            const payStr = shop.pay || '';
                                                            let badgeLabel = '협';
                                                            let badgeColor = 'bg-gray-400';
                                                            let amount = payStr;

                                                            if (payStr.includes('TC') || payStr.includes('시급')) {
                                                                badgeLabel = '시';
                                                                badgeColor = 'bg-indigo-400';
                                                                amount = payStr.replace('TC', '').trim();
                                                            } else if (payStr.includes('일') || payStr.includes('당일')) {
                                                                badgeLabel = '당';
                                                                badgeColor = 'bg-cyan-400';
                                                                amount = payStr.replace('일', '').trim();
                                                            } else if (payStr.includes('주급')) {
                                                                badgeLabel = '주';
                                                                badgeColor = 'bg-pink-400';
                                                                amount = payStr.replace('주급', '').trim();
                                                            } else if (payStr.includes('월')) {
                                                                badgeLabel = '월';
                                                                badgeColor = 'bg-purple-400';
                                                                amount = payStr.replace('월', '').trim();
                                                            } else if (payStr.includes('협의')) {
                                                                badgeLabel = '협';
                                                                badgeColor = 'bg-gray-400';
                                                                amount = '면접후결정';
                                                            }

                                                            return (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-black text-gray-900">{amount}</span>
                                                                    <span className={`${badgeColor} text-white px-1 rounded text-[9px] font-bold`}>{badgeLabel}</span>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => toggleFavorite(e, shop.id)}
                                                    className={`p-1 mt-1 transition-all ${isFav ? 'text-amber-400' : 'text-gray-200'}`}
                                                >
                                                    <Star size={20} fill={isFav ? "currentColor" : "none"} />
                                                </button>
                                            </div>
                                            {(i + 1) % 3 === 0 && (
                                                <Link href="/my-shop" className="block p-4 bg-amber-50/50 border-y border-amber-100 active:bg-amber-100 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg shadow-amber-100 shrink-0">
                                                            AD
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-[14px] font-black text-gray-900 truncate">사장님, 광고 한칸 어떠세요?</h4>
                                                            <p className="text-[11px] text-amber-600 font-bold">합리적인 비용으로 최고의 효율을 선사합니다.</p>
                                                        </div>
                                                        <ChevronRight size={18} className="text-amber-400" />
                                                    </div>
                                                </Link>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <div className="p-10 text-center text-gray-400 text-sm">등록된 공고가 없습니다.</div>
                            )}
                        </div>
                    </div>
                </div>

                {visibleCount < sortedShops.length && (
                    <button
                        onClick={() => setVisibleCount(prev => prev + 10)}
                        className="w-full mt-6 py-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 font-bold text-sm hover:bg-gray-50 transition-colors"
                    >
                        공고 더보기 ({sortedShops.length - visibleCount}개 남음)
                    </button>
                )}

                {/* Shop Detail Modal */}
                {selectedShop && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedShop(null)}>
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp" onClick={e => e.stopPropagation()}>
                            <div className={`p-6 text-center text-white relative ${selectedShop.tier === 'grand' ? 'bg-gradient-to-br from-amber-400 to-yellow-600' : 'bg-gray-800'}`}>
                                <button onClick={() => setSelectedShop(null)} className="absolute top-4 right-4 text-white/80 hover:text-white">
                                    <X size={24} />
                                </button>
                                <div className="flex justify-center mb-3">
                                    <span className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold backdrop-blur-md shadow-inner">
                                        {selectedShop.site === 'catalba' ? 'C' : selectedShop.site === 'badalba' ? 'B' : selectedShop.site === 'ladyalba' ? 'L' : 'Q'}
                                    </span>
                                </div>
                                <h2 className="text-xl font-black mb-1 break-keep leading-snug">{selectedShop.name}</h2>
                                <p className="text-white/80 text-xs">{selectedShop.region} | {selectedShop.workType}</p>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                                        <p className="text-xs text-gray-400 mb-1">시급/일급</p>
                                        <p className="text-red-500 font-bold text-sm">{selectedShop.pay}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                                        <p className="text-xs text-gray-400 mb-1">근무형태</p>
                                        <p className="text-gray-700 font-bold text-sm">{selectedShop.workType}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <a href={`tel:${selectedShop.phone}`} className="flex items-center justify-center gap-2 w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-200">
                                        <Phone size={20} /> 전화 걸기 ({selectedShop.phone})
                                    </a>
                                    {selectedShop.kakao && (
                                        <div className="flex items-center justify-between p-4 bg-yellow-300 rounded-xl text-yellow-900 font-bold">
                                            <div className="flex items-center gap-2">
                                                <MessageCircle size={20} />
                                                <span>카카오톡 ID</span>
                                            </div>
                                            <span className="bg-white/50 px-2 py-1 rounded text-sm select-all cursor-text">{selectedShop.kakao}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                                <p className="text-[10px] text-gray-400">{brand.displayName}를 통해 연락했다고 말씀해주세요!</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer Keywords */}
            <footer className="max-w-4xl mx-auto px-4 py-10 opacity-30">
                <div className="text-[10px] flex flex-wrap gap-2 justify-center">
                    <span>{regionName}알바</span>
                    <span>{regionName}여성알바</span>
                    <span>{regionName}룸알바</span>
                    <span>{regionName}노래방알바</span>
                    <span>{regionName}밤알바</span>
                </div>
            </footer>
        </div>
    );
}
