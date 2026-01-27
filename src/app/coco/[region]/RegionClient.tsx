'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, MapPin, Phone, MessageSquare, TrendingUp, Sparkles, Home, Star } from 'lucide-react';

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

                <div className="mb-6 flex items-center justify-between">
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        추천 업소 리스트
                        <span className="bg-amber-100 text-amber-600 text-[9px] px-2 py-0.5 rounded-full font-black animate-pulse">AD OPEN</span>
                    </h2>
                    <span className={`text-xs font-bold ${brand.theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>인기순</span>
                </div>

                <div className="space-y-4">
                    {/* [VIRTUAL AD] 지역 최상단 그랜드 프리미엄 (SEO 최적화 타겟팅) */}
                    <div className="bg-gradient-to-br from-amber-400 via-yellow-100 to-amber-600 p-0.5 rounded-3xl shadow-xl shadow-amber-200/50 group cursor-pointer hover:-translate-y-1 transition-all">
                        <div className={`rounded-[22px] p-6 relative overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                            <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black px-4 py-1 rounded-bl-2xl shadow-sm">REGION GRAND</div>
                            <div className="flex gap-5 items-center mb-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:rotate-3 transition-transform ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-amber-50'}`}>✨</div>
                                <div>
                                    <p className="text-[10px] font-black text-amber-600 mb-1 tracking-tighter uppercase">가장 먼저 만나는 {regionName} 대표 업소</p>
                                    <h3 className={`text-xl font-black leading-tight ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>광고주님, 이 자리를 선점하세요!</h3>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>#지역1위</span>
                                <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>#노출보장</span>
                                <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${brand.theme === 'dark' ? 'bg-amber-900/20 border-amber-900/30 text-amber-500' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>#우대혜택</span>
                            </div>
                            <button className={`w-full py-4 rounded-2xl font-black text-sm transition-colors ${brand.theme === 'dark' ? 'bg-amber-600 text-white shadow-xl shadow-amber-950/20 hover:bg-amber-700' : 'bg-gray-900 text-white shadow-lg shadow-gray-200 hover:bg-amber-600'}`}>상세보기 및 광고문의</button>
                        </div>
                    </div>
                    {sortedShops.length > 0 ? (
                        sortedShops.map((shop, i) => {
                            const isAdPos = (i + 1) % 5 === 0;

                            return (
                                <React.Fragment key={shop.id || i}>
                                    <div
                                        className={`rounded-2xl p-5 shadow-sm border transition-all group relative overflow-hidden
                                            ${brand.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}
                                            ${brand.theme === 'dark' ?
                                                (shop.tier === 'grand' ? 'border-amber-500 ring-2 ring-amber-900/30' :
                                                    shop.tier === 'preferential' ? 'border-gray-500 ring-2 ring-gray-800/30' :
                                                        shop.tier === 'premium' ? 'border-blue-700' :
                                                            shop.tier === 'special' ? 'border-rose-700' :
                                                                shop.tier === 'urgent' ? 'border-red-900/50 bg-red-950/10' :
                                                                    shop.tier === 'recommended' ? 'border-green-700' : 'border-gray-800')
                                                :
                                                (shop.tier === 'grand' ? 'border-amber-400 ring-2 ring-amber-100 shadow-xl' :
                                                    shop.tier === 'preferential' ? 'border-gray-400 ring-2 ring-gray-100 shadow-lg' :
                                                        shop.tier === 'premium' ? 'border-blue-400' :
                                                            shop.tier === 'special' ? 'border-rose-400' :
                                                                shop.tier === 'urgent' ? 'border-red-500 bg-red-50/5' :
                                                                    shop.tier === 'recommended' ? 'border-green-400' : 'border-gray-200')}
                                        `}
                                    >
                                        {shop.tier && shop.tier !== 'common' && (
                                            <div className={`absolute top-0 right-0 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl z-10
                                                ${shop.tier === 'grand' ? 'bg-amber-500' :
                                                    shop.tier === 'preferential' ? 'bg-gray-600' :
                                                        shop.tier === 'premium' ? 'bg-blue-500' :
                                                            shop.tier === 'special' ? 'bg-rose-500' :
                                                                shop.tier === 'urgent' ? 'bg-red-600 animate-pulse' :
                                                                    shop.tier === 'recommended' ? 'bg-green-500' : 'bg-gray-400'}
                                            `}>
                                                {shop.tier === 'grand' ? '1번 - GRAND' :
                                                    shop.tier === 'preferential' ? '2번 - 우대' :
                                                        shop.tier === 'premium' ? '3번 - PREMIUM' :
                                                            shop.tier === 'special' ? '4번 - SPECIAL' :
                                                                shop.tier === 'urgent' ? '5번 - 급구' :
                                                                    shop.tier === 'recommended' ? '6번 - 추천' : '7번 - 일반'}
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-1 mb-1">
                                                    <span className="text-[10px] font-medium text-gray-400">{shop.site}</span>
                                                    {shop.is_verified && <ShieldCheck size={10} className="text-blue-500" />}
                                                </div>
                                                <h3 className={`text-lg font-black flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                                    <a href={shop.url || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors">
                                                        {shop.name}
                                                    </a>
                                                    {shop.is_verified && <CheckCircle2 size={14} className="text-blue-500 fill-blue-50" />}
                                                </h3>
                                                <div className="flex items-center gap-1 mt-1 text-gray-400">
                                                    <MapPin size={12} />
                                                    <span className="text-xs">{shop.region}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className={`p-2 rounded-lg ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                                <p className="text-[10px] text-gray-500 font-bold mb-0.5">급여 조건</p>
                                                <p className="text-xs font-black text-rose-600">{shop.pay}</p>
                                            </div>
                                            <div className={`p-2 rounded-lg ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                                <p className="text-[10px] text-gray-500 font-bold mb-0.5">근무 형태</p>
                                                <p className={`text-xs font-black ${brand.theme === 'dark' ? 'text-gray-300' : 'text-black'}`}>{shop.workType}</p>
                                            </div>
                                        </div>

                                        <div className="mb-4 text-center">
                                            <p className="text-[10px] text-gray-400 italic">"코코알바를 통해 연락했다고 말씀해주세요!"</p>
                                        </div>

                                        <div className="flex gap-2">
                                            <a
                                                href={shop.phone ? `tel:${shop.phone}` : '#'}
                                                className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${brand.theme === 'dark' ? 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700' : 'bg-gray-900 text-white hover:bg-black'}`}
                                            >
                                                <Phone size={16} /> 전화상담
                                            </a>
                                            <a
                                                href={shop.kakao ? `https://pf.kakao.com/_` : '#'}
                                                className="flex-1 bg-[#FEE500] text-[#3c1e1e] py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                                            >
                                                <MessageSquare size={16} /> 카톡문의
                                            </a>
                                        </div>
                                    </div>

                                    {/* [VIRTUAL AD] 리스트 중간 네이티브 광고 (Special) */}
                                    {isAdPos && (
                                        <div className="bg-rose-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Sparkles size={80} />
                                            </div>
                                            <div className="relative z-10 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-black text-rose-100 uppercase tracking-widest mb-1 italic">Special Listing AD</p>
                                                    <h4 className="text-lg font-black leading-tight">여기는 광고 자리입니다! 💎<br />우리 가게를 돋보이게 하세요.</h4>
                                                </div>
                                                <div className="bg-white text-rose-600 p-3 rounded-2xl font-black text-[12px] shadow-xl group-hover:scale-110 transition-transform">문의하기</div>
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })
                    ) : (
                        <div className={`text-center py-20 rounded-3xl border border-dashed ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                            <p className="text-gray-400 text-sm">해당 지역의 상세 공고가 업데이트 중입니다.</p>
                            <Link href="/" className="text-pink-500 font-bold text-sm mt-4 inline-block">전체 공고 보러가기</Link>
                        </div>
                    )}
                </div>

                {/* Bottom CTA */}
                <div className={`mt-12 p-6 rounded-3xl text-center ${brand.theme === 'dark' ? 'bg-gray-900 text-white border border-gray-800' : 'bg-gray-900 text-white'}`}>
                    <h4 className="font-bold mb-2">사장님이신가요?</h4>
                    <p className="text-xs text-gray-400 mb-6">{regionName} 지역 1위 노출을 지금 시작하세요.</p>
                    <Link href="/" className="bg-pink-500 text-white px-8 py-3 rounded-full text-sm font-bold inline-block">
                        3개월 무료 등록하기
                    </Link>
                </div>
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
