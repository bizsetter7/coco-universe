'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Crown, Search, MapPin, Filter, RotateCcw, ArrowUp, Menu, X, Bell, User, Sparkles, LogIn, Heart, Star, Phone, Home, Flame, Gem, Trophy, Siren, Zap, Briefcase } from 'lucide-react';
import Link from 'next/link';

// Components
import { Button } from '@/components/ui/button';
import { Badge } from '../../components/ui/badge'; // Relative path check
import JobListView from '@/components/jobs/JobListView';
import LeftSidebar from '@/components/LeftSidebar'; // Corrected Path
import JobAdSection from '@/components/ads/JobAdSection'; // Corrected Path
import JobDetailModal from '@/components/jobs/JobDetailModal';
import { PaymentPopup } from '@/components/home/PaymentPopup';

// Types & Data
import { Shop } from '@/types/shop';
import { useBrand } from '@/components/BrandProvider';
import { Footer } from '@/components/layout/Footer';
import { REGIONS_MAP, REGION_LIST } from '@/constants/regions';
import { JOB_CATEGORY_MAP, JOB_CATEGORIES } from '@/constants/jobs';

interface RegionClientProps {
    shops: Shop[];
}

export default function RegionClient({ shops }: RegionClientProps) {
    const brand = useBrand();
    const router = useRouter();
    const searchParams = useSearchParams();

    // -- State --
    const [selectedRegion, setSelectedRegion] = useState('전체');
    const [selectedSubRegion, setSelectedSubRegion] = useState('전체');
    const [selectedJobType, setSelectedJobType] = useState('전체');
    const [selectedSubJobType, setSelectedSubJobType] = useState('전체');
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSearchQuery, setActiveSearchQuery] = useState('');

    // Pagination / Limits
    const [grandLimit, setGrandLimit] = useState(12);
    const [premiumLimit, setPremiumLimit] = useState(8);
    const [deluxeLimit, setDeluxeLimit] = useState(8);
    const [specialLimit, setSpecialLimit] = useState(8);
    const [urgentLimit, setUrgentLimit] = useState(8);
    const [visibleCount, setVisibleCount] = useState(20);

    // Modal & Menu State
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    // Favorites State
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('favorites');
        if (saved) setFavorites(JSON.parse(saved));
    }, []);

    const toggleFavorite = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newFavs = favorites.includes(id)
            ? favorites.filter(fid => fid !== id)
            : [...favorites, id];
        setFavorites(newFavs);
        localStorage.setItem('favorites', JSON.stringify(newFavs));
    };

    // Payment Popup State
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [targetTier, setTargetTier] = useState('grand');

    const openPaymentPopup = (tier: string) => {
        setTargetTier(tier);
        setShowPaymentPopup(true);
    };

    // Sidebar Sticky Logic
    const sidebarRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [stickyStyle, setStickyStyle] = useState<{ top: string | number }>({ top: '6rem' });

    // Click outside handler for dropdowns
    useEffect(() => {
        function handleClickOutside() {
            setOpenDropdown(null);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const updateStickyBehavior = () => {
            if (!sidebarRef.current) return;

            const sidebarHeight = sidebarRef.current.offsetHeight;
            const viewportHeight = window.innerHeight;
            const topOffset = 96; // 6rem (top-24)
            const bottomBuffer = 40; // Space from bottom

            // Calculate the diff
            // If sidebar is short: viewport > sidebar + topOffset -> Stick to top (96px)
            // If sidebar is tall: Stick so bottom is visible -> top = viewport - sidebar - bottomBuffer

            const targetTop = viewportHeight - sidebarHeight - bottomBuffer;

            if (targetTop >= topOffset) {
                // Sidebar fits comfortably with top offset
                setStickyStyle({ top: '6rem' }); // top-24
            } else {
                // Sidebar is too tall, need to scroll to see bottom
                setStickyStyle({ top: `${targetTop}px` });
            }
        };

        const observer = new ResizeObserver(updateStickyBehavior);
        if (sidebarRef.current) observer.observe(sidebarRef.current);
        window.addEventListener('resize', updateStickyBehavior);

        updateStickyBehavior(); // Initial check

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateStickyBehavior);
        };
    }, []);

    // -- Data Filtering --
    const filteredShops = useMemo(() => {
        return shops.filter(shop => {
            // Region Filter
            if (selectedRegion !== '전체' && !shop.region.includes(selectedRegion)) return false;
            if (selectedSubRegion !== '전체' && !shop.region.includes(selectedSubRegion)) return false;

            // Job Type Filter
            if (selectedJobType !== '전체' && !shop.workType.includes(selectedJobType)) return false;
            if (selectedSubJobType !== '전체' && !shop.workType.includes(selectedSubJobType)) return false;

            // Search Query Filter
            if (activeSearchQuery) {
                const query = activeSearchQuery.toLowerCase();
                const matchName = shop.name.toLowerCase().includes(query) || (shop.realName && shop.realName.toLowerCase().includes(query));
                const matchRegion = shop.region.toLowerCase().includes(query);
                const matchType = shop.workType.toLowerCase().includes(query);
                const matchTitle = shop.title && shop.title.toLowerCase().includes(query);

                if (!matchName && !matchRegion && !matchType && !matchTitle) return false;
            }

            return true;
        });
    }, [shops, selectedRegion, selectedSubRegion, selectedJobType, selectedSubJobType]);

    // Tier Separation
    const grandShops = filteredShops.filter(s => s.tier === 'grand');
    const premiumShops = filteredShops.filter(s => s.tier === 'premium');
    const deluxeShops = filteredShops.filter(s => s.tier === 'deluxe');
    const specialShops = filteredShops.filter(s => s.tier === 'special');
    const urgentShops = filteredShops.filter(s => s.tier === 'urgent' || s.tier === 'recommended'); // Group urgent/rec
    const generalShops = filteredShops; // All shops for the list view

    const primaryStyle = { color: brand.primaryColor };

    return (
        <div className={`min-h-screen ${brand.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>

            {/* 1. Header (Sticky) */}
            <header className={`sticky top-0 z-50 border-b backdrop-blur-md ${brand.theme === 'dark' ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'} transition-all`}>
                <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-1">
                            <span className={brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}>{brand.displayName.split(' ')[0]}</span>
                            <span style={primaryStyle} className="ml-0.5">{brand.displayName.split(' ').slice(1).join(' ')}</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => router.push('/?page=login')} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                                로그인
                            </Button>
                            <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white font-bold gap-2 shadow-lg shadow-pink-500/20" onClick={() => openPaymentPopup('grand')}>
                                <Crown size={14} /> 사장님 무료등록
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. Hero Section (Slider Banner) */}
            <div className="max-w-[1280px] mx-auto px-4 mt-6">
                <div className="relative h-32 md:h-40 bg-gray-900 rounded-[24px] overflow-hidden group">
                    {/* Banner Content (5 items mock) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-pink-900 flex items-center justify-center text-white">
                        <div className="text-center">
                            <h2 className="text-xl md:text-2xl font-black mb-1">코코알바만의 특별한 혜택</h2>
                            <p className="text-sm opacity-80">지금 가입하고 무료 광고 혜택을 누리세요</p>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronLeft size={24} />
                    </button>
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={24} />
                    </button>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-y-1/2 flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/40'}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Main Content (Sidebar + Main Area) */}
            <div className="w-full max-w-[1280px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

                {/* Left Sidebar */}
                <aside className="hidden lg:block w-[220px] shrink-0 space-y-6">
                    <div ref={sidebarRef} style={stickyStyle} className="sticky transition-[top] duration-200">
                        <LeftSidebar
                            selectedRegion={selectedRegion}
                            setSelectedRegion={setSelectedRegion}
                            setSelectedSubRegion={setSelectedSubRegion}
                            selectedJobType={selectedJobType}
                            setSelectedJobType={setSelectedJobType}
                            selectedKeywords={selectedKeywords}
                            setSelectedKeywords={setSelectedKeywords}
                            onLoginClick={() => router.push('/?page=login')}
                            onSignupClick={() => router.push('/?page=signup')}
                            onPaymentClick={openPaymentPopup}
                        />
                    </div>
                </aside>

                {/* Main Area */}
                <main className="flex-1 min-w-0 space-y-8">
                    {/* Header: Title & Announcement */}
                    <div className="space-y-6">
                        <div className="flex flex-col gap-6">
                            <h1 className="text-3xl font-black flex items-center gap-2">
                                <span className="w-1.5 h-8 bg-pink-500 rounded-full"></span>
                                지역별 채용
                            </h1>

                            {/* Center Tabs (Full Width like Notice Box) */}
                            <div className="flex justify-center">
                                <div className="flex gap-1 bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-full">
                                    {['업종별 채용', '지역별 채용', '오늘본공고'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => {
                                                if (tab === '업종별 채용') router.push('/jobs');
                                                else if (tab === '지역별 채용') router.push('/region');
                                            }}
                                            className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-all ${tab === '지역별 채용' ? 'bg-pink-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Announcement Bar */}
                        <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${brand.theme === 'dark' ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-100 hover:shadow-md hover:-translate-y-0.5'}`}>
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className="bg-pink-600 text-white text-[10px] px-2 py-1 rounded-lg font-black shrink-0 uppercase tracking-wider shadow-sm">공지사항</span>
                                <p className="text-[13px] font-bold text-gray-700 dark:text-gray-200 truncate">[안내] 프리미엄 광고 "Grand Tier" 서비스 개편 및 혜택 안내</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 shrink-0" />
                        </div>

                        {/* Search Filter Box with Dropdowns */}
                        <div className="space-y-3">
                            <div className={`p-6 rounded-[32px] border shadow-xl ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 relative z-20`}>

                                {/* Item 1: Region (First) */}
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === 'region' ? null : 'region'); }}
                                        className={`w-full h-12 bg-gray-50 dark:bg-gray-900 border ${openDropdown === 'region' ? 'border-pink-500' : 'border-gray-100 dark:border-gray-700'} rounded-2xl text-sm font-black flex items-center justify-between px-4 hover:border-pink-300 transition-all group`}
                                    >
                                        <span className="truncate">{selectedRegion === '전체' ? '지역선택' : selectedRegion}</span>
                                        <ChevronLeft size={16} className={`text-gray-400 transition-transform ${openDropdown === 'region' ? 'rotate-90' : '-rotate-90'}`} />
                                    </button>
                                    {openDropdown === 'region' && (
                                        <div onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50 grid grid-cols-2">
                                            {['전체', ...REGION_LIST].map(reg => (
                                                <button
                                                    key={reg}
                                                    onClick={() => { setSelectedRegion(reg); setSelectedSubRegion('전체'); setOpenDropdown(null); }}
                                                    className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 rounded-xl transition-colors"
                                                >
                                                    {reg}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Item 2: Sub Region (Second) */}
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === 'subRegion' ? null : 'subRegion'); }}
                                        className={`w-full h-12 bg-gray-50 dark:bg-gray-900 border ${openDropdown === 'subRegion' ? 'border-pink-500' : 'border-gray-100 dark:border-gray-700'} rounded-2xl text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between px-4 hover:border-pink-300 transition-all group`}
                                    >
                                        <span className="truncate">{selectedSubRegion === '전체' ? '세부지역' : selectedSubRegion}</span>
                                        <ChevronLeft size={16} className={`text-gray-400 transition-transform ${openDropdown === 'subRegion' ? 'rotate-90' : '-rotate-90'}`} />
                                    </button>
                                    {openDropdown === 'subRegion' && (
                                        <div onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50 grid grid-cols-2">
                                            {['전체', ...(selectedRegion !== '전체' ? REGIONS_MAP[selectedRegion] : [])].map(sub => (
                                                <button
                                                    key={sub}
                                                    onClick={() => { setSelectedSubRegion(sub); setOpenDropdown(null); }}
                                                    className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 rounded-xl transition-colors"
                                                >
                                                    {sub}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Item 3: Job Type (Third) */}
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === 'job' ? null : 'job'); }}
                                        className={`w-full h-12 bg-gray-50 dark:bg-gray-900 border ${openDropdown === 'job' ? 'border-pink-500' : 'border-gray-100 dark:border-gray-700'} rounded-2xl text-sm font-black flex items-center justify-between px-4 hover:border-pink-300 transition-all group`}
                                    >
                                        <span className="truncate">{selectedJobType === '전체' ? '직종선택' : selectedJobType}</span>
                                        <ChevronLeft size={16} className={`text-gray-400 transition-transform ${openDropdown === 'job' ? 'rotate-90' : '-rotate-90'}`} />
                                    </button>
                                    {openDropdown === 'job' && (
                                        <div onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                            {['전체', ...JOB_CATEGORIES].map(job => (
                                                <button
                                                    key={job}
                                                    onClick={() => { setSelectedJobType(job); setSelectedSubJobType('전체'); setOpenDropdown(null); }}
                                                    className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 rounded-xl transition-colors"
                                                >
                                                    {job}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Item 4: Sub Job Type (Fourth) */}
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === 'subJob' ? null : 'subJob'); }}
                                        className={`w-full h-12 bg-gray-50 dark:bg-gray-900 border ${openDropdown === 'subJob' ? 'border-pink-500' : 'border-gray-100 dark:border-gray-700'} rounded-2xl text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between px-4 hover:border-pink-300 transition-all group`}
                                    >
                                        <span className="truncate">{selectedSubJobType === '전체' ? '상세직종' : selectedSubJobType}</span>
                                        <ChevronLeft size={16} className={`text-gray-400 transition-transform ${openDropdown === 'subJob' ? 'rotate-90' : '-rotate-90'}`} />
                                    </button>
                                    {openDropdown === 'subJob' && (
                                        <div onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                            {['전체', ...(selectedJobType !== '전체' ? JOB_CATEGORY_MAP[selectedJobType] : [])].map(item => (
                                                <button
                                                    key={item}
                                                    onClick={() => { setSelectedSubJobType(item); setOpenDropdown(null); }}
                                                    className="w-full text-left px-4 py-2 text-sm font-bold hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 rounded-xl transition-colors"
                                                >
                                                    {item}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="relative lg:col-span-1">
                                    <input
                                        type="text"
                                        placeholder="키워드 검색"
                                        className="w-full h-12 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 text-sm font-bold outline-none focus:border-pink-300 transition-all font-black"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setActiveSearchQuery(searchQuery);
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={() => setActiveSearchQuery(searchQuery)}
                                    className="h-12 bg-pink-600 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:bg-pink-700 hover:shadow-lg hover:shadow-pink-500/30 active:scale-95 transition-all"
                                >
                                    <Search size={18} />
                                    검색
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 3.1 그랜드 오픈 / VIP 채용 */}
                    <JobAdSection
                        title="그랜드 오픈 / VIP 채용"
                        icon={<Crown className="text-amber-500" size={24} />}
                        shops={shops.filter(s => s.tier === 'grand')}
                        limit={8}
                        tier="grand"
                        brand={brand}
                        setSelectedShop={setSelectedShop}
                        showAdButton={true}
                        onAdRegister={() => openPaymentPopup('grand')}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                    />

                    {/* 3.2 프리미엄 채용정보 */}
                    <JobAdSection
                        title="프리미엄 채용정보"
                        icon={<Star className="text-purple-500" size={24} />}
                        shops={shops.filter(s => s.tier === 'premium')}
                        limit={8}
                        tier="premium"
                        brand={brand}
                        setSelectedShop={setSelectedShop}
                        showAdButton={true}
                        onAdRegister={() => openPaymentPopup('premium')}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                    />

                    {/* 3.3 디럭스 채용정보 */}
                    <JobAdSection
                        title="디럭스 채용정보"
                        icon={<Gem className="text-blue-500" size={24} />}
                        shops={shops.filter(s => s.tier === 'deluxe')}
                        limit={deluxeLimit}
                        tier="deluxe"
                        brand={brand}
                        setSelectedShop={setSelectedShop}
                        showAdButton={true}
                        onAdRegister={() => openPaymentPopup('deluxe')}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                    />

                    {/* 3.4 스페셜 채용정보 */}
                    <JobAdSection
                        title="스페셜 채용정보"
                        icon={<Trophy className="text-emerald-500" size={24} />}
                        shops={shops.filter(s => s.tier === 'special')}
                        limit={specialLimit}
                        tier="special"
                        brand={brand}
                        setSelectedShop={setSelectedShop}
                        showAdButton={true}
                        onAdRegister={() => openPaymentPopup('special')}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                    />

                    {/* 3.5 Urgent / Recommended (8 items) */}
                    <JobAdSection
                        title="급구 / 추천 채용"
                        icon={<Flame className="text-red-600" size={24} />}
                        shops={urgentShops}
                        limit={8}
                        tier="urgent"
                        brand={brand}
                        setSelectedShop={setSelectedShop}
                        showAdButton={true}
                        onAdRegister={() => openPaymentPopup('urgent')}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                    />

                    {/* 4. General List View */}
                    <div className="pt-0">
                        <JobListView
                            shops={generalShops}
                            brand={brand}
                            favorites={favorites}
                            toggleFavorite={toggleFavorite}
                            setSelectedShop={setSelectedShop}
                            visibleCount={visibleCount}
                            setVisibleCount={setVisibleCount}
                            onAdRegister={() => openPaymentPopup('basic')}
                            onNativeAdRegister={() => openPaymentPopup('native')}
                        />
                    </div>
                </main>
            </div>

            {/* Modal */}
            <JobDetailModal shop={selectedShop} onClose={() => setSelectedShop(null)} />

            <PaymentPopup
                isOpen={showPaymentPopup}
                onClose={() => setShowPaymentPopup(false)}
                initialTier={targetTier}
            />

            <Footer />
        </div>
    );
}
