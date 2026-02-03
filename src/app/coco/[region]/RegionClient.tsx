'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Crown, Star, ChevronLeft, ChevronRight, Pencil, Search, X, Phone, Home, MessageCircle, PlusCircle, Sparkles, User, Zap, Flame, MapPin, Gift
} from 'lucide-react';
import { REGIONS_MAP, REGION_LIST } from '@/constants/regions';
import { JOB_CATEGORY_MAP, JOB_CATEGORIES } from '@/constants/jobs';
import LeftSidebar from '@/components/LeftSidebar';
import { useBrand } from '@/components/BrandProvider';
import Link from 'next/link';

import { Footer } from '@/components/layout/Footer';
import { Shop } from '@/types/shop';


interface RegionClientProps {
    regionName: string;
    shops: Shop[];
}

const REGION_BANNERS = [
    { id: 1, title: '터치 없음 순수 테이블', desc: 'NO 터치 가라오케 티시 16만원 지급', brand: 'SEOUL 강남별', color: 'bg-gray-900', text: 'text-amber-400' },
    { id: 2, title: '최고의 근무 환경', desc: '깔끔한 시설과 최고의 대우', brand: '역삼 더킹', color: 'bg-indigo-900', text: 'text-white' },
    { id: 3, title: '비즈니스 룸 전문', desc: '확실한 손님 층 보장', brand: '선릉 오션', color: 'bg-pink-900', text: 'text-pink-200' },
    { id: 4, title: '고수익 단기 알바', desc: '당일 지급 원칙 준수', brand: '논현 스타', color: 'bg-purple-900', text: 'text-purple-300' },
    { id: 5, title: '주말 특별 모집', desc: '주말 근무자 특별 보너스 지급', brand: '청담 루이', color: 'bg-slate-800', text: 'text-blue-300' },
];

export default function RegionClient({ regionName, shops: initialShops }: RegionClientProps) {
    const brand = useBrand();
    const router = useRouter();
    const [bannerIndex, setBannerIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(10);
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [favorites, setFavorites] = useState<string[]>([]);

    // Filter States - Default to local region from prop
    const initialRegion = regionName === '전국' ? '전체' : (regionName.includes('-') ? regionName.split('-')[0] : regionName);
    const initialSubRegion = regionName.includes('-') ? regionName.split('-')[1] : '전체';

    const [selectedRegion, setSelectedRegion] = useState(initialRegion);
    const [selectedSubRegion, setSelectedSubRegion] = useState(initialSubRegion);
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [selectedJobType, setSelectedJobType] = useState('전체');
    const [searchKeyword, setSearchKeyword] = useState('');

    // Pre-fetch
    useEffect(() => {
        router.prefetch('/');
        router.prefetch('/community');
        router.prefetch('/lounge');
        router.prefetch('/jobs');
    }, [router]);

    // Banner Auto Scroll
    useEffect(() => {
        const interval = setInterval(() => {
            setBannerIndex(prev => (prev + 1) % REGION_BANNERS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Load favorites
    useEffect(() => {
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

    // [핵심] 7단계 등급 체계 변환 (JobClient.tsx 및 page.tsx와 100% 동기화)
    const processedShops = useMemo(() => {
        return initialShops.map((shop, index) => {
            let tier = shop.tier || 'common';
            if (tier === 'basic') tier = 'common';

            if (tier === 'common') {
                if (index % 100 === 5) tier = 'deluxe';
                else if (index % 100 === 10) tier = 'special';
                else if (index % 100 === 15) tier = 'urgent';
                else if (index % 100 === 20) tier = 'recommended';
                else if (index % 100 === 25) tier = 'native';
            }
            if (tier === 'grand' && index % 3 === 1) tier = 'premium';
            return { ...shop, tier };
        });
    }, [initialShops]);

    // Filter Logic
    const baseFilteredShops = useMemo(() => {
        return processedShops.filter(shop => {
            if (selectedJobType !== '전체') {
                if (shop.workType !== selectedJobType) return false;
            } else if (selectedCategory !== '전체') {
                const validTypes = JOB_CATEGORY_MAP[selectedCategory] || [];
                if (!validTypes.includes(shop.workType) && shop.workType !== selectedCategory) return false;
            }
            if (selectedRegion !== '전체') {
                if (!shop.region.includes(selectedRegion)) return false;
                if (selectedSubRegion !== '전체' && !shop.region.includes(selectedSubRegion)) return false;
            }
            if (searchKeyword) {
                const keyword = searchKeyword.toLowerCase();
                return shop.name.toLowerCase().includes(keyword) || shop.region.toLowerCase().includes(keyword);
            }
            return true;
        });
    }, [processedShops, selectedCategory, selectedJobType, selectedRegion, selectedSubRegion, searchKeyword]);

    const grandPremiumShops = useMemo(() => {
        const grands = baseFilteredShops.filter(s => s.tier === 'grand');
        const premiums = baseFilteredShops.filter(s => s.tier === 'premium');
        const interleaved: Shop[] = [];
        const maxLen = Math.max(grands.length, premiums.length);
        for (let i = 0; i < maxLen; i++) {
            if (grands[i]) interleaved.push(grands[i]);
            if (premiums[i]) interleaved.push(premiums[i]);
        }
        return interleaved;
    }, [baseFilteredShops]);

    const deluxeShops = useMemo(() => baseFilteredShops.filter(s => s.tier === 'deluxe'), [baseFilteredShops]);
    const specialShops = useMemo(() => baseFilteredShops.filter(s => s.tier === 'special'), [baseFilteredShops]);
    const urgentRecShops = useMemo(() => baseFilteredShops.filter(s => s.tier === 'urgent' || s.tier === 'recommended'), [baseFilteredShops]);

    const sortedShops = useMemo(() => {
        return baseFilteredShops
            .filter(shop => shop.tier === 'common' || shop.tier === 'native' || !shop.tier)
            .sort((a, b) => {
                const tierOrder = { grand: 8, premium: 7, deluxe: 6, special: 5, urgent: 4, recommended: 3, native: 2, common: 1, basic: 0 };
                return (tierOrder[b.tier || 'common'] || 0) - (tierOrder[a.tier || 'common'] || 0);
            });
    }, [baseFilteredShops]);

    const [grandLimit, setGrandLimit] = useState(12);
    const [deluxeLimit, setDeluxeLimit] = useState(8);
    const [specialLimit, setSpecialLimit] = useState(8);
    const [urgentLimit, setUrgentLimit] = useState(8);

    const primaryStyle = { color: brand.primaryColor };
    const primaryBgStyle = { backgroundColor: brand.primaryColor };

    const getStableNumber = (id: string, min: number, max: number) => {
        const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return (seed % (max - min + 1)) + min;
    };

    return (
        <div className={`w-full max-w-full ${brand.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 md:bg-white text-black'}`}>
            {/* Standard Header */}
            <header className={`sticky top-0 z-50 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 md:bg-gray-800/95' : 'bg-white border-gray-100 md:bg-white/95'} md:backdrop-blur-md shadow-sm border-b`}>
                <div className="max-w-[1280px] mx-auto px-3 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push('/')}>
                        <ChevronLeft className="md:hidden mr-1" size={24} />
                        <span className="text-xl sm:text-2xl font-black tracking-tighter">
                            {brand.displayName.split(' ')[0]}
                            <span style={primaryStyle} className="ml-1">
                                {brand.displayName.split(' ').slice(1).join(' ')}
                            </span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button className="text-xs sm:text-sm text-gray-500 hover:text-gray-900 whitespace-nowrap" onClick={() => router.push('/?page=login')}>로그인</button>
                        <button
                            style={primaryBgStyle}
                            className="text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-md hover:opacity-90 transition flex items-center gap-1 whitespace-nowrap"
                            onClick={() => router.push('/?page=payment')}
                        >
                            <Pencil size={12} className="sm:w-[14px] sm:h-[14px]" />
                            <span className="hidden sm:inline">사장님 무료등록</span>
                            <span className="sm:hidden">무료등록</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="w-full max-w-[1280px] mx-auto px-0 md:px-4 py-0 md:py-8 min-h-screen bg-gray-50 md:bg-white">

                {/* 1. Hero Banner Carousel */}
                <div className="relative w-full h-[160px] md:h-[180px] bg-gray-900 overflow-hidden md:rounded-3xl mb-0 md:mb-8 group">
                    <div className="flex transition-transform duration-500 ease-in-out h-full" style={{ transform: `translateX(-${bannerIndex * 100}%)` }}>
                        {REGION_BANNERS.map((banner) => (
                            <div key={banner.id} className={`w-full h-full flex-shrink-0 relative ${banner.color}`}>
                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse"></div>
                                <div className="absolute inset-0 flex items-center justify-between px-8 md:px-16">
                                    <div className="z-10 space-y-2">
                                        <span className={`text-[10px] md:text-xs font-black px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 uppercase tracking-widest ${banner.text}`}>{banner.brand}</span>
                                        <h3 className="text-xl md:text-3xl font-black text-white leading-tight break-keep drop-shadow-lg">{banner.title}</h3>
                                        <p className="text-xs md:text-sm font-bold text-gray-300 drop-shadow-md">{banner.desc}</p>
                                    </div>
                                    <div className="hidden md:flex w-16 h-16 rounded-full bg-white/10 items-center justify-center border border-white/20 shadow-2xl backdrop-blur-md">
                                        <Crown className={banner.text} size={32} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setBannerIndex(prev => (prev === 0 ? REGION_BANNERS.length - 1 : prev - 1))} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 backdrop-blur-md rounded-full text-white/50 hover:text-white border border-white/10 transition-all"><ChevronLeft size={24} /></button>
                    <button onClick={() => setBannerIndex(prev => (prev + 1) % REGION_BANNERS.length)} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 backdrop-blur-md rounded-full text-white/50 hover:text-white border border-white/10 transition-all"><ChevronRight size={24} /></button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                        {REGION_BANNERS.map((_, i) => (
                            <div key={i} onClick={() => setBannerIndex(i)} className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all cursor-pointer ${i === bannerIndex ? 'bg-white w-4 md:w-6' : 'bg-white/30'}`} />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-0 lg:gap-6">
                    {/* Left Sidebar (PC) */}
                    <LeftSidebar
                        selectedRegion={selectedRegion}
                        setSelectedRegion={setSelectedRegion}
                        setSelectedSubRegion={setSelectedSubRegion}
                        selectedJobType={selectedJobType}
                        setSelectedJobType={setSelectedJobType}
                        onLoginClick={() => router.push('/?page=login')}
                        onSignupClick={() => router.push('/?page=signup')}
                        onPaymentClick={() => router.push('/?page=payment')}
                    />

                    {/* Main Content */}
                    <div className="flex-1 px-4 pt-6 pb-0 md:px-0">
                        <div className="flex flex-col gap-4 mb-6">
                            <h3 className={`text-2xl md:text-3xl font-black flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                <span className="text-pink-600">|</span> {regionName} 채용정보
                            </h3>

                            <div onClick={() => router.push('/customer-center?tab=notice')} className={`cursor-pointer flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="bg-pink-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md whitespace-nowrap">공지사항</span>
                                    <span className={`text-[12px] md:text-sm font-black truncate ${brand.theme === 'dark' ? 'text-gray-100' : 'text-black'}`}>[안내] {regionName} 지역 광고 혜택 및 서비스 개편 안내</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-400 shrink-0" />
                            </div>

                            <div className="flex border-b-2 border-gray-100 mt-2">
                                {['업종별 채용', '지역별 채용', '오늘본광고'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            if (tab === '업종별 채용') router.push('/jobs');
                                            else if (tab === '지역별 채용') router.push('/?page=region');
                                            else if (tab === '오늘본광고') router.push('/');
                                        }}
                                        className={`flex-1 py-3 text-[13px] md:text-sm font-black text-center relative transition-colors ${tab === '지역별 채용' ? 'text-pink-600 border-b-2 border-pink-600 -mb-0.5' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search Form (Region First - As Requested) */}
                        <div className={`p-3.5 md:p-6 rounded-[20px] md:rounded-[32px] border shadow-sm space-y-2 md:space-y-0 md:flex md:items-center md:gap-3 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>

                            {/* Region Select */}
                            <div className="grid grid-cols-1 gap-1 md:gap-0 flex-[2] md:flex md:items-center md:gap-2">
                                <label className="md:hidden text-[10px] font-black text-gray-500 pl-1 uppercase tracking-tight">지역</label>
                                <div className="grid grid-cols-2 gap-2 md:w-full">
                                    <select
                                        className={`w-full p-2.5 md:p-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold border md:border-2 appearance-none transition-all cursor-pointer ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-pink-500 focus:bg-white'}`}
                                        value={selectedRegion}
                                        onChange={(e) => {
                                            setSelectedRegion(e.target.value);
                                            setSelectedSubRegion('전체');
                                        }}
                                    >
                                        <option value="전체">지역선택</option>
                                        {REGION_LIST.map(reg => (
                                            <option key={reg} value={reg}>{reg}</option>
                                        ))}
                                    </select>
                                    <select
                                        disabled={selectedRegion === '전체'}
                                        className={`w-full p-2.5 md:p-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold border md:border-2 appearance-none transition-all cursor-pointer disabled:opacity-50 ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-pink-500 focus:bg-white'}`}
                                        value={selectedSubRegion}
                                        onChange={(e) => setSelectedSubRegion(e.target.value)}
                                    >
                                        <option value="전체">세부지역</option>
                                        {selectedRegion !== '전체' && (REGIONS_MAP[selectedRegion] as string[])?.map((sub: string) => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Job Select */}
                            <div className="grid grid-cols-1 gap-1 md:gap-0 flex-[2] md:flex md:items-center md:gap-2">
                                <label className="md:hidden text-[10px] font-black text-gray-500 pl-1">직종</label>
                                <div className="grid grid-cols-2 gap-2 md:w-full">
                                    <select
                                        className={`w-full p-2.5 md:p-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold border md:border-2 appearance-none transition-all cursor-pointer ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-pink-500 focus:bg-white'}`}
                                        value={selectedCategory}
                                        onChange={(e) => {
                                            setSelectedCategory(e.target.value);
                                            setSelectedJobType('전체');
                                        }}
                                    >
                                        <option value="전체">직종선택</option>
                                        {JOB_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <select
                                        disabled={selectedCategory === '전체'}
                                        className={`w-full p-2.5 md:p-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold border md:border-2 appearance-none transition-all cursor-pointer disabled:opacity-50 ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-pink-500 focus:bg-white'}`}
                                        value={selectedJobType}
                                        onChange={(e) => setSelectedJobType(e.target.value)}
                                    >
                                        <option value="전체">상세직종</option>
                                        {selectedCategory !== '전체' && JOB_CATEGORY_MAP[selectedCategory]?.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Keyword Input */}
                            <div className="grid grid-cols-1 gap-1 md:gap-0 flex-[2] relative">
                                <input
                                    type="text"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    placeholder="키워드 검색 (예: 강남)"
                                    className={`w-full p-2.5 md:p-3 rounded-lg md:rounded-xl font-medium text-xs md:text-sm border md:border-2 transition-all ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-100 text-gray-900 placeholder-gray-400 focus:border-pink-500 focus:bg-white'}`}
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-pink-500 md:hidden">
                                    <Search size={16} />
                                </button>
                            </div>

                            {/* Search Button */}
                            <div className="pt-1 md:pt-0 w-full md:w-auto">
                                <button className="w-full md:w-auto md:px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-black text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all">
                                    <Search size={16} />
                                    <span>검색</span>
                                </button>
                            </div>
                        </div>

                        {/* Ad Sections (Standardized - Sync with JobClient) */}
                        <div className="space-y-12 mt-12">
                            {/* 1. Grand / Premium */}
                            {grandPremiumShops.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={`text-lg md:text-xl font-black flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                            <Star className="text-amber-500" size={20} />
                                            그랜드/프리미엄
                                        </h3>
                                        <button onClick={() => router.push('/?page=payment')} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-pink-600 text-white hover:bg-pink-700 transition">광고신청</button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-3">
                                        {grandPremiumShops.slice(0, grandLimit).map((shop, idx) => {
                                            const tierConfig: Record<string, { bg: string; text: string; label: string }> = {
                                                grand: { bg: 'bg-gradient-to-r from-amber-500 to-yellow-400', text: 'text-white', label: '그랜드' },
                                                premium: { bg: 'bg-gradient-to-r from-purple-600 to-pink-500', text: 'text-white', label: '프리미엄' },
                                            };
                                            const tier = tierConfig[shop.tier || 'grand'] || tierConfig.grand;
                                            return (
                                                <div key={shop.id || idx} onClick={() => setSelectedShop(shop)} className={`rounded-xl overflow-hidden border shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                                    <div className={`h-24 md:h-28 ${tier.bg} relative flex items-center justify-center`}>
                                                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black ${tier.bg} ${tier.text} shadow-sm border border-white/20`}>{tier.label}</span>
                                                        <Crown className="text-white/50" size={32} />
                                                        <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">TOP {idx + 1}</span>
                                                    </div>
                                                    <div className="p-3">
                                                        <h4 className={`text-[13px] font-black truncate mb-1 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>{shop.realName || shop.name}</h4>
                                                        <p className="text-[11px] text-gray-500 truncate mb-1.5">{shop.region}</p>
                                                        <p className="text-[12px] font-bold text-pink-600 truncate">{shop.pay || '급여 협의'}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {grandPremiumShops.length > grandLimit && <button onClick={() => setGrandLimit(prev => prev + 12)} className={`w-full py-2.5 rounded-lg border font-black text-[11px] transition-all flex items-center justify-center gap-1 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>더보기 +</button>}
                                </div>
                            )}

                            {/* 2. Deluxe */}
                            {deluxeShops.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={`flex items-center gap-2 text-xl font-black ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}><Zap className="text-blue-500" size={22} /> 디럭스 채용</h3>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-3">
                                        {deluxeShops.slice(0, deluxeLimit).map((shop, idx) => (
                                            <div key={shop.id || idx} onClick={() => setSelectedShop(shop)} className={`rounded-xl overflow-hidden border shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                                <div className="h-24 md:h-28 bg-gradient-to-r from-blue-600 to-cyan-500 relative flex items-center justify-center">
                                                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black bg-blue-700 text-white shadow-sm border border-white/20">디럭스</span>
                                                    <Zap className="text-white/50" size={32} />
                                                </div>
                                                <div className="p-3">
                                                    <h4 className={`text-[13px] font-black truncate mb-1 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>{shop.realName || shop.name}</h4>
                                                    <p className="text-[11px] text-gray-500 truncate mb-1.5">{shop.region}</p>
                                                    <p className="text-[12px] font-bold text-blue-600 truncate">{shop.pay || '급여 협의'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {deluxeShops.length > deluxeLimit && <button onClick={() => setDeluxeLimit(prev => prev + 8)} className={`w-full py-2.5 rounded-lg border font-black text-[11px] transition-all flex items-center justify-center gap-1 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>더보기 +</button>}
                                </div>
                            )}

                            {/* 3. Special */}
                            {specialShops.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={`text-lg md:text-xl font-black flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                            <Sparkles className="text-pink-500" size={20} />
                                            스페셜
                                        </h3>
                                        <button onClick={() => router.push('/?page=payment')} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-pink-600 text-white hover:bg-pink-700 transition">광고신청</button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-3">
                                        {specialShops.slice(0, specialLimit).map((shop, idx) => (
                                            <div key={shop.id || idx} onClick={() => setSelectedShop(shop)} className={`rounded-xl overflow-hidden border shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                                <div className="h-24 md:h-28 bg-gradient-to-r from-pink-600 to-rose-400 relative flex items-center justify-center">
                                                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black bg-pink-800 text-white shadow-sm border border-white/20">스페셜</span>
                                                    <Sparkles className="text-white/50" size={32} />
                                                </div>
                                                <div className="p-3">
                                                    <h4 className={`text-[13px] font-black truncate mb-1 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>{shop.realName || shop.name}</h4>
                                                    <p className="text-[11px] text-gray-500 truncate mb-1.5">{shop.region}</p>
                                                    <p className="text-[12px] font-bold text-pink-500 truncate">{shop.pay || '급여 협의'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {specialShops.length > specialLimit && <button onClick={() => setSpecialLimit(prev => prev + 8)} className={`w-full py-2.5 rounded-lg border font-black text-[11px] transition-all flex items-center justify-center gap-1 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>더보기 +</button>}
                                </div>
                            )}

                            {/* 4. Urgent / Recommended */}
                            {urgentRecShops.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={`text-lg md:text-xl font-black flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                            <Flame className="text-red-500" size={20} />
                                            급구 / 추천 채용
                                        </h3>
                                        <button onClick={() => router.push('/?page=payment')} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-pink-600 text-white hover:bg-pink-700 transition">광고신청</button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-3">
                                        {urgentRecShops.slice(0, urgentLimit).map((shop, idx) => {
                                            const isUrgent = shop.tier === 'urgent';
                                            return (
                                                <div key={shop.id || idx} onClick={() => setSelectedShop(shop)} className={`rounded-xl overflow-hidden border shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                                    <div className={`h-24 md:h-28 ${isUrgent ? 'bg-gradient-to-r from-red-600 to-orange-500' : 'bg-gradient-to-r from-emerald-600 to-teal-500'} relative flex items-center justify-center`}>
                                                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black text-white shadow-sm border border-white/20 ${isUrgent ? 'bg-red-800' : 'bg-emerald-800'}`}>{isUrgent ? '급구' : '추천'}</span>
                                                        {isUrgent ? <Flame className="text-white/50" size={32} /> : <Gift className="text-white/50" size={32} />}
                                                    </div>
                                                    <div className="p-3">
                                                        <h4 className={`text-[13px] font-black truncate mb-1 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>{shop.realName || shop.name}</h4>
                                                        <p className="text-[11px] text-gray-500 truncate mb-1.5">{shop.region}</p>
                                                        <p className={`text-[12px] font-bold truncate ${isUrgent ? 'text-red-500' : 'text-emerald-500'}`}>{shop.pay || '급여 협의'}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {urgentRecShops.length > urgentLimit && <button onClick={() => setUrgentLimit(prev => prev + 8)} className={`w-full py-2.5 rounded-lg border font-black text-[11px] transition-all flex items-center justify-center gap-1 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>더보기 +</button>}
                                </div>
                            )}
                        </div>

                        {/* List Section (JobClient standard) */}
                        <div id="job-list-section" className="mt-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className={`text-xl md:text-2xl font-black flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'} `}>
                                    <MapPin size={24} className="text-pink-500" />
                                    <span>최신 구인정보</span>
                                    <span className="bg-rose-100 text-rose-600 text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse uppercase">Live</span>
                                </h2>
                            </div>

                            <div className={`rounded-2xl border shadow-sm overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                                {/* Desktop Table */}
                                <div className="hidden md:block">
                                    <table className="w-full text-left text-sm border-collapse table-fixed">
                                        <thead className={`border-b ${brand.theme === 'dark' ? 'bg-gray-900/80 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                                            <tr>
                                                <th className="w-[80px] px-3 py-3.5 font-black text-gray-500 text-center">지역</th>
                                                <th className="w-[70px] px-3 py-3.5 font-black text-gray-500 text-center">스크랩</th>
                                                <th className="w-[180px] px-3 py-3.5 font-black text-gray-500 text-center">업소명</th>
                                                <th className="w-[100px] px-3 py-3.5 font-black text-gray-500 text-center">직종</th>
                                                <th className="px-3 py-3.5 font-black text-gray-500 text-center">모집내용</th>
                                                <th className="w-[130px] px-3 py-3.5 font-black text-gray-500 text-center pr-[31px]">급여</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`divide-y ${brand.theme === 'dark' ? 'divide-gray-800' : 'divide-gray-100'}`}>
                                            {sortedShops.length > 0 ? (
                                                sortedShops.slice(0, visibleCount).map((shop, i) => {
                                                    const isFav = favorites.includes(shop.id);
                                                    return (
                                                        <React.Fragment key={shop.id || i}>
                                                            <tr onClick={() => setSelectedShop(shop)} className={`transition-colors cursor-pointer ${brand.theme === 'dark' ? 'hover:bg-gray-900' : 'hover:bg-gray-50'}`}>
                                                                <td className="px-3 py-4 text-center font-bold text-blue-600 truncate">{shop.region.split(' ').slice(0, 2).join(' ')}</td>
                                                                <td className="px-3 py-4 text-center">
                                                                    <button onClick={(e) => toggleFavorite(e, shop.id)} className={`p-1 transition-all ${isFav ? 'text-amber-400' : 'text-gray-200'}`}>
                                                                        <Star size={18} fill={isFav ? "currentColor" : "none"} />
                                                                    </button>
                                                                </td>
                                                                <td className="px-3 py-4 font-black truncate">{shop.name}</td>
                                                                <td className="px-3 py-4 text-gray-500 text-center truncate">{shop.workType}</td>
                                                                <td className="px-3 py-4 truncate font-bold text-gray-600">{shop.name}에서 함께 일할 가족을 모집합니다.</td>
                                                                <td className="px-3 py-4 text-right pr-[31px] font-black text-red-600">{shop.pay}</td>
                                                            </tr>
                                                            {(i + 1) % 5 === 0 && i !== sortedShops.length - 1 && (
                                                                <tr>
                                                                    <td colSpan={6} className="p-2">
                                                                        <div className="p-4 rounded-xl border-2 border-dashed border-pink-300 bg-pink-50/50 flex items-center justify-between">
                                                                            <div>
                                                                                <h4 className="text-[15px] font-black text-black mb-0.5">사장님, 광고 한칸 어떠세요?</h4>
                                                                                <p className="text-[11px] text-gray-500">매출 UP 효과 보장!</p>
                                                                            </div>
                                                                            <button onClick={(e) => { e.stopPropagation(); router.push('/?page=payment'); }} className="px-4 py-2 bg-pink-600 text-white rounded-xl text-xs font-bold hover:bg-pink-700 transition flex items-center gap-1">
                                                                                <PlusCircle size={14} /> 광고등록
                                                                            </button>
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

                                {/* Mobile List View */}
                                <div className="md:hidden divide-y divide-gray-100">
                                    {sortedShops.length > 0 ? (
                                        sortedShops.slice(0, visibleCount).map((shop, i) => {
                                            const isFav = favorites.includes(shop.id);
                                            return (
                                                <React.Fragment key={shop.id || i}>
                                                    <div onClick={() => setSelectedShop(shop)} className={`p-4 active:bg-gray-50 transition-colors flex justify-between items-start gap-3 ${brand.theme === 'dark' ? 'bg-gray-900 active:bg-gray-800' : 'bg-white'}`}>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className={`text-[15px] font-bold mb-1.5 break-keep line-clamp-1 truncate ${brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                                                                {shop.options?.blink && <span className="text-red-500 mr-1">♥</span>}
                                                                {shop.name}에서 함께 일할 가족을 모집합니다.
                                                            </h3>
                                                            <div className="flex items-center gap-1.5 text-[12px] flex-wrap">
                                                                {shop.tier && shop.tier !== 'common' && (
                                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${shop.tier === 'grand' ? 'bg-amber-100 text-amber-600' : shop.tier === 'special' ? 'bg-purple-100 text-purple-600' : shop.tier === 'premium' ? 'bg-blue-100 text-blue-600' : shop.tier === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                                        {shop.tier === 'grand' ? '그랜드' : shop.tier === 'premium' ? '프리미엄' : shop.tier === 'deluxe' ? '디럭스' : shop.tier === 'special' ? '스페셜' : shop.tier === 'urgent' ? '급구' : shop.tier === 'recommended' ? '추천' : shop.tier === 'native' ? '네이티브' : '일반'}
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
                                                                    if (payStr.includes('TC') || payStr.includes('시급')) { badgeLabel = '시'; badgeColor = 'bg-indigo-400'; }
                                                                    else if (payStr.includes('일') || payStr.includes('당일')) { badgeLabel = '당'; badgeColor = 'bg-cyan-400'; }
                                                                    else if (payStr.includes('주급')) { badgeLabel = '주'; badgeColor = 'bg-pink-400'; }
                                                                    else if (payStr.includes('월')) { badgeLabel = '월'; badgeColor = 'bg-purple-400'; }

                                                                    return (
                                                                        <div className="flex items-center gap-1 font-bold">
                                                                            <span className={`${badgeColor} text-white text-[9px] px-1 rounded-sm uppercase`}>{badgeLabel}</span>
                                                                            <span className={`${brand.theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{amount}</span>
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <button onClick={(e) => toggleFavorite(e, shop.id)} className={`p-1 transition-all ${isFav ? 'text-amber-400' : 'text-gray-200'}`}>
                                                                <Star size={22} fill={isFav ? "currentColor" : "none"} />
                                                            </button>
                                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{shop.workType}</span>
                                                        </div>
                                                    </div>
                                                    {(i + 1) % 3 === 0 && i !== sortedShops.length - 1 && (
                                                        <div className="p-4 border-b border-gray-100">
                                                            <div className="p-4 rounded-xl border-2 border-dashed border-pink-300 bg-pink-50/50 flex items-center justify-between">
                                                                <div>
                                                                    <h4 className="text-[14px] font-black text-black mb-0.5">사장님, 광고 한칸 어떠세요?</h4>
                                                                    <p className="text-[10px] text-gray-500">매출 UP 효과 보장!</p>
                                                                </div>
                                                                <button onClick={(e) => { e.stopPropagation(); router.push('/?page=payment'); }} className="px-3 py-1.5 bg-pink-600 text-white rounded-lg text-xs font-bold hover:bg-pink-700 transition">광고등록</button>
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

                            {visibleCount < sortedShops.length && (
                                <button onClick={() => setVisibleCount(prev => prev + 10)} className="w-full mt-6 py-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 font-bold text-sm hover:bg-gray-50 transition-colors">
                                    공고 더보기 ({sortedShops.length - visibleCount}개 남음)
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Standard Footer */}
            {/* Standard Footer */}
            <Footer />

            {/* Shop Detail Modal */}
            {selectedShop && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedShop(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className={`p-6 text-center text-white relative ${selectedShop.tier === 'grand' ? 'bg-gradient-to-br from-amber-400 to-yellow-600' : 'bg-gray-800'}`}>
                            <button onClick={() => setSelectedShop(null)} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"><X size={24} /></button>
                            <h2 className="text-xl font-black mb-1">{selectedShop.name}</h2>
                            <p className="text-white/80 text-xs">{selectedShop.region} | {selectedShop.workType}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <a href={`tel:${selectedShop.phone}`} className="flex items-center justify-center gap-2 w-full py-4 bg-green-500 text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition-all active:scale-95">
                                <Phone size={20} /> 전화 걸기
                            </a>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
