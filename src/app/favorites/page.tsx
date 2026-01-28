'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Star, ChevronRight, X, Phone, MessageCircle, ArrowLeft } from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';
import shopsData from '@/lib/data/shops.json';

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
    options?: {
        blink?: boolean;
    };
}

export default function FavoritesPage() {
    const brand = useBrand();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('coco-favorites');
        if (saved) setFavorites(JSON.parse(saved));
    }, []);

    const toggleFavorite = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newFavorites = favorites.filter(fav => fav !== id);
        setFavorites(newFavorites);
        localStorage.setItem('coco-favorites', JSON.stringify(newFavorites));
    };

    const favoriteShops = (shopsData as Shop[]).filter(shop => favorites.includes(shop.id));

    return (
        <div className={`min-h-screen pb-20 ${brand.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <header className={`sticky top-0 z-50 border-b ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="max-w-4xl mx-auto px-3 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className={`${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <ArrowLeft size={22} />
                        </Link>
                        <h1 className={`text-lg font-black ${brand.theme === 'dark' ? 'text-gray-100' : 'text-black'}`}>내 보관함</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-3 py-6">
                <div className="mb-6 flex items-center gap-2 text-amber-500 font-bold">
                    <Star size={18} fill="currentColor" />
                    <span>전체 {favoriteShops.length}개</span>
                </div>

                {favoriteShops.length > 0 ? (
                    <div className={`rounded-2xl border shadow-sm overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className={`border-b ${brand.theme === 'dark' ? 'bg-gray-900/80 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                    <tr>
                                        <th className="px-3 py-3.5 font-black text-gray-500 whitespace-nowrap">지역</th>
                                        <th className="px-3 py-3.5 font-black text-gray-500 whitespace-nowrap text-center">삭제</th>
                                        <th className="px-3 py-3.5 font-black text-gray-500 whitespace-nowrap">업소명</th>
                                        <th className="px-3 py-3.5 font-black text-gray-500 whitespace-nowrap">직종</th>
                                        <th className="px-3 py-3.5 font-black text-gray-500 text-right whitespace-nowrap">급여</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${brand.theme === 'dark' ? 'divide-gray-800' : 'divide-gray-50'}`}>
                                    {favoriteShops.map((shop, i) => (
                                        <tr
                                            key={shop.id || i}
                                            onClick={() => setSelectedShop(shop)}
                                            className={`transition-colors cursor-pointer group ${brand.theme === 'dark' ? 'hover:bg-rose-900/10' : 'hover:bg-rose-50/50'}`}
                                        >
                                            <td className="px-3 py-4 whitespace-nowrap">
                                                <span className="text-blue-600 font-extrabold">{shop.region.split(' ').slice(0, 2).join(' ')}</span>
                                            </td>
                                            <td className="px-3 py-4 text-center">
                                                <button onClick={(e) => toggleFavorite(e, shop.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                    <X size={18} />
                                                </button>
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="flex items-center gap-1.5 overflow-hidden">
                                                    {shop.tier && shop.tier !== 'common' && (
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${shop.tier === 'grand' ? 'bg-amber-100 text-amber-600 border border-amber-200' : shop.tier === 'special' ? 'bg-purple-100 text-purple-600 border border-purple-200' : shop.tier === 'premium' ? 'bg-blue-100 text-blue-600 border border-blue-200' : shop.tier === 'urgent' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-600'}`}>
                                                            {shop.tier === 'grand' ? '그랜드' : shop.tier === 'special' ? '스페셜' : shop.tier === 'premium' ? '프리미엄' : shop.tier === 'urgent' ? '급구' : shop.tier === 'preferential' ? '우대' : shop.tier === 'recommended' ? '추천' : '일반'}
                                                        </span>
                                                    )}
                                                    <div className={`font-black max-w-[120px] truncate group-hover:text-rose-600 transition-colors ${brand.theme === 'dark' ? 'text-gray-100' : 'text-black'}`}>
                                                        {shop.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-gray-500 font-bold whitespace-nowrap">{shop.workType}</td>
                                            <td className="px-3 py-4 text-right">
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
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile FoxAlba Style List View */}
                        <div className="md:hidden">
                            <div className={`divide-y ${brand.theme === 'dark' ? 'divide-gray-800' : 'divide-gray-100'}`}>
                                {favoriteShops.map((shop, i) => (
                                    <div
                                        key={shop.id || i}
                                        onClick={() => setSelectedShop(shop)}
                                        className={`p-4 active:bg-gray-50 transition-colors flex justify-between items-start gap-3 ${brand.theme === 'dark' ? 'bg-gray-900 active:bg-gray-800' : 'bg-white'}`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`text-[15px] font-bold mb-1.5 break-keep line-clamp-1 truncate ${brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                                                {shop.options?.blink && <span className="text-red-500 mr-1">♥</span>}
                                                {shop.name}에서 함께 일할 가족을 모집합니다.
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-[12px] flex-wrap">
                                                {shop.tier && shop.tier !== 'common' && (
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${shop.tier === 'grand' ? 'bg-amber-100 text-amber-600' : shop.tier === 'special' ? 'bg-purple-100 text-purple-600' : shop.tier === 'premium' ? 'bg-blue-100 text-blue-600' : shop.tier === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                        {shop.tier === 'grand' ? '그랜드' : shop.tier === 'special' ? '스페셜' : shop.tier === 'premium' ? '프리미엄' : shop.tier === 'urgent' ? '급구' : shop.tier === 'preferential' ? '우대' : shop.tier === 'recommended' ? '추천' : '일반'}
                                                    </span>
                                                )}
                                                <span className="text-blue-500 font-extrabold truncate max-w-[120px] flex items-center gap-0.5">
                                                    {shop.options?.blink ? '▶' : '♥'}{shop.name}{shop.options?.blink ? '◀' : '♥'}
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
                                            className="p-1 mt-1 transition-all text-amber-400"
                                        >
                                            <Star size={20} fill="currentColor" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <Star size={32} />
                        </div>
                        <p className="text-gray-500 font-bold mb-6">보관된 공고가 없습니다.<br />마음에 드는 공고를 즐겨찾기 해보세요!</p>
                        <Link href="/" className="px-6 py-3 bg-pink-500 text-white font-bold rounded-xl shadow-lg shadow-pink-100 active:scale-95 transition-transform">
                            공고 전체 보러가기
                        </Link>
                    </div>
                )}
            </main>

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
        </div>
    );
}
