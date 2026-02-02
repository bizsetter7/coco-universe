'use client';

import React, { useState, useMemo, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { useBrand } from '@/components/BrandProvider';
import { Shop } from '@/types/shop';

// Sub Components
import { HeroSection } from './HeroSection';
import { QuickMenu } from './QuickMenu';
import JobAdSection from '@/components/ads/JobAdSection';
import JobListView from '@/components/jobs/JobListView'; // Re-use list view
import { PaymentPopup } from './PaymentPopup';
import JobDetailModal from '@/components/jobs/JobDetailModal';
import { useAuth } from '@/hooks/useAuth';

// Icons
import { Crown, Zap, Sparkles, Flame, Siren, ArrowUp, X, User, MessageSquare, Megaphone } from 'lucide-react';
import { MOCK_POSTS } from '@/constants/community';
import { Button } from '@/components/ui/button';

interface HomeClientProps {

    shops: Shop[];
}

// Gradient Map
const TIER_GRADIENTS: Record<string, string> = {
    grand: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    premium: 'bg-gradient-to-r from-purple-600 to-pink-500',
    deluxe: 'bg-gradient-to-r from-blue-500 to-cyan-400',
    special: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    urgent: 'bg-gradient-to-r from-rose-500 to-orange-400',
    recommended: 'bg-gradient-to-r from-indigo-500 to-violet-400',
    native: 'bg-gray-100',
    common: 'bg-gray-50'
};

export default function HomeClient({ shops }: HomeClientProps) {
    const brand = useBrand();
    const router = useRouter();
    const { isLoggedIn } = useAuth();

    // -- State --
    const [selectedRegion, setSelectedRegion] = useState('전체');
    const [grandLimit, setGrandLimit] = useState(8);
    const [premiumLimit, setPremiumLimit] = useState(8);
    const [deluxeLimit, setDeluxeLimit] = useState(8); // Default 8
    const [specialLimit, setSpecialLimit] = useState(8); // Default 8
    const [urgentLimit, setUrgentLimit] = useState(8);
    const [visibleCount, setVisibleCount] = useState(20);
    const [favorites, setFavorites] = useState<string[]>([]); // Favorites state

    const toggleFavorite = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    // Modal State
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [targetTier, setTargetTier] = useState('grand');

    const openPaymentPopup = (tier: string) => {
        setTargetTier(tier);
        setShowPaymentPopup(true);
    };

    // -- Logic --
    const filteredShops = useMemo(() => {
        if (selectedRegion === '전체') return shops;
        return shops.filter(shop => shop.region.includes(selectedRegion));
    }, [shops, selectedRegion]);

    const grandShops = filteredShops.filter(s => s.tier === 'grand');
    const premiumShops = filteredShops.filter(s => s.tier === 'premium');
    const deluxeShops = filteredShops.filter(s => s.tier === 'deluxe');
    const specialShops = filteredShops.filter(s => s.tier === 'special');
    const urgentShops = filteredShops.filter(s => s.tier === 'urgent' || s.tier === 'recommended');
    const generalShops = filteredShops;

    return (
        <div className={`w-full ${brand.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'} pb-24 md:pb-0 transition-colors duration-300`}>
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800 md:bg-white/80 md:backdrop-blur-md md:dark:bg-gray-900/80 [will-change:transform] transform-gpu">
                <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => { setSelectedRegion('전체'); window.scrollTo({ top: 0, behavior: 'smooth' }); router.push('/'); }}
                    >
                        <span className="text-xl md:text-2xl font-black tracking-tighter text-gray-900 dark:text-white">
                            COCO <span className="text-amber-400 ml-0.5">코코알바</span>
                        </span>
                    </div>

                    {/* Right Buttons */}
                    <div className="flex items-center gap-2 md:gap-4">
                        <Button
                            variant="ghost"
                            className="text-gray-600 hover:text-black hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white font-bold text-xs md:text-sm px-2 md:px-4"
                            onClick={() => router.push('/?page=login')}
                        >
                            로그인
                        </Button>
                        <Button
                            onClick={() => openPaymentPopup('grand')}
                            className="font-bold rounded-full text-xs md:text-sm px-3 py-1.5 md:px-5 md:py-2 shadow-md transition-all hover:scale-105 active:scale-95 border-none"
                            style={{ backgroundColor: '#FFBF00', color: 'white' }}
                        >
                            <span className="hidden md:inline">✏️ </span>사장님 무료등록
                        </Button>
                    </div>
                </div>
            </header>

            <main className="w-full">
                <HeroSection />
                <QuickMenu />

                {/* Dashboard (PC/Mobile 2-Columns) - Restored from backup - Wrapped for 1200px */}
                <div className="w-full max-w-[1200px] mx-auto px-4 mt-4 md:mt-10">
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 mb-0 max-w-[1200px] mx-auto">
                        <div onClick={() => router.push('/community')} className={`border p-3.5 sm:p-6 rounded-[28px] sm:rounded-[32px] shadow-sm cursor-pointer hover:shadow-md transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-pink-100'} `}>
                            <div className="flex justify-between items-center mb-3 sm:mb-5">
                                <span className="font-extrabold text-pink-600 flex items-center gap-1.5 sm:gap-2.5 text-sm sm:text-lg"><MessageSquare size={18} /> 커뮤니티</span>
                                <span className={`text-[9px] sm:text-[11px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full hidden sm:block ${brand.theme === 'dark' ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-50 text-gray-400'} `}>자유게시판</span>
                            </div>
                            <div className="space-y-2.5 sm:space-y-4">
                                {MOCK_POSTS.slice(0, 3).map(post => (
                                    <div key={post.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                                            <span className={`shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center text-[10px] sm:text-[12px] group-hover:bg-pink-600 group-hover:text-white transition-all ${brand.theme === 'dark' ? 'bg-pink-900/10' : 'bg-pink-50'} `}>
                                                {post.category === '친구찾기' ? '👥' : post.category === '블랙리스트' ? '🚨' : '💬'}
                                            </span>
                                            <p className={`truncate text-[11px] sm:text-[13px] font-black ${brand.theme === 'dark' ? 'text-gray-100' : 'text-black'} `}>
                                                {post.title}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 실시간 공지사항 */}
                        <div onClick={() => router.push('/customer-center?tab=notice')} className={`border p-3.5 sm:p-6 rounded-[28px] sm:rounded-[32px] shadow-sm cursor-pointer hover:shadow-md transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'} `}>
                            <div className="flex justify-between items-center mb-3 sm:mb-5">
                                <span className="font-extrabold text-blue-600 flex items-center gap-1.5 sm:gap-2.5 text-sm sm:text-lg"><Megaphone size={18} /> 공지사항</span>
                                <span className={`text-[9px] sm:text-[11px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full hidden sm:block ${brand.theme === 'dark' ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-50 text-gray-400'} `}>업데이트</span>
                            </div>
                            <div className="space-y-2.5 sm:space-y-4">
                                {[
                                    { title: '[중요] 서비스 전면 개편 및 광고 상품 단가 확정 안내', isNew: true },
                                    { title: 'PC 사이드배너 광고 시스템 정식 도입', isNew: false },
                                    { title: '브랜드 통합 시스템 리뉴얼 안내', isNew: false }
                                ].map((n, i) => (
                                    <div key={i} className={`flex items-center justify-between gap-2 sm:gap-3 border-b pb-2 sm:pb-2.5 last:border-0 last:pb-0 ${brand.theme === 'dark' ? 'border-gray-700/50' : 'border-gray-50'} `}>
                                        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                                            <div className={`shrink-0 w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full ${n.isNew ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'} `}></div>
                                            <p className={`truncate text-[11px] sm:text-[13px] font-black ${brand.theme === 'dark' ? 'text-gray-100' : 'text-black'} `}>{n.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="w-full max-w-[1200px] mx-auto px-4 pt-10 pb-8 space-y-6 md:space-y-8">
                    {/* 5.1 Grand & Premium */}
                    {(grandShops.length > 0 || premiumShops.length > 0) && (
                        <div className="space-y-6 md:space-y-8 px-0 md:px-0">
                            {grandShops.length > 0 && (
                                <JobAdSection
                                    title="그랜드 오픈 / VIP 채용"
                                    icon={<Crown className="text-amber-500" size={24} />}
                                    shops={grandShops}
                                    limit={grandLimit}
                                    onMore={() => setGrandLimit(prev => prev + 8)}
                                    tier="grand"
                                    brand={brand}
                                    setSelectedShop={setSelectedShop}
                                    showAdButton={true}
                                    onAdRegister={() => openPaymentPopup('grand')}
                                    favorites={favorites}
                                    toggleFavorite={toggleFavorite}
                                />
                            )}
                            {premiumShops.length > 0 && (
                                <JobAdSection
                                    title="프리미엄 채용정보"
                                    icon={<Crown className="text-purple-500" size={24} />}
                                    shops={premiumShops}
                                    limit={premiumLimit}
                                    onMore={() => setPremiumLimit(prev => prev + 8)}
                                    tier="premium"
                                    brand={brand}
                                    setSelectedShop={setSelectedShop}
                                    showAdButton={true}
                                    onAdRegister={() => openPaymentPopup('premium')}
                                    favorites={favorites}
                                    toggleFavorite={toggleFavorite}
                                />
                            )}
                        </div>
                    )}

                    {/* 5.2 Deluxe & Special */}
                    <div className="space-y-6 md:space-y-8 px-0 md:px-0">
                        <JobAdSection
                            title="디럭스 채용"
                            icon={<Zap className="text-blue-500" size={24} />}
                            shops={deluxeShops}
                            limit={deluxeLimit}
                            onMore={() => setDeluxeLimit(prev => prev + 8)}
                            tier="deluxe"
                            brand={brand}
                            setSelectedShop={setSelectedShop}
                            showAdButton={true}
                            onAdRegister={() => openPaymentPopup('deluxe')}
                            favorites={favorites}
                            toggleFavorite={toggleFavorite}
                        />
                        <JobAdSection
                            title="스페셜 채용"
                            icon={<Sparkles className="text-teal-500" size={24} />}
                            shops={specialShops}
                            limit={specialLimit}
                            onMore={() => setSpecialLimit(prev => prev + 8)}
                            tier="special"
                            brand={brand}
                            setSelectedShop={setSelectedShop}
                            showAdButton={true}
                            onAdRegister={() => openPaymentPopup('special')}
                            favorites={favorites}
                            toggleFavorite={toggleFavorite}
                        />
                    </div>

                    {/* 5.3 Urgent */}
                    <div className="px-0 md:px-0">
                        <JobAdSection
                            title="급구 / 추천 채용"
                            icon={<Siren className="text-rose-500" size={24} />}
                            shops={urgentShops}
                            limit={urgentLimit}
                            onMore={() => setUrgentLimit(prev => prev + 8)}
                            tier="urgent"
                            brand={brand}
                            setSelectedShop={setSelectedShop}
                            showAdButton={true}
                            onAdRegister={() => openPaymentPopup('urgent')}
                            favorites={favorites}
                            toggleFavorite={toggleFavorite}
                        />
                    </div>

                    {/* 5.4 List View */}
                    <div className="px-0 md:px-0">
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

                    {/* 5.5 Talent Discovery Section */}
                    <div className="px-4 md:px-0">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
                                    <User className="text-purple-600" />
                                    실시간 인재 발굴
                                </h2>
                                <p className="text-gray-500 mt-1 text-sm">
                                    <span className="text-purple-600 font-bold">언니들</span>이 사장님을 기다리고 있어요!
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-gray-500 font-bold"
                                onClick={() => router.push('/talent')}
                            >
                                인재 전체보기 &gt;
                            </Button>
                        </div>

                        {/* Talent Table View Match Screenshot */}
                        <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                            {/* Header */}
                            <div className="grid grid-cols-4 bg-gray-50/50 dark:bg-gray-700/50 p-5 text-center text-xs md:text-sm font-bold text-gray-900 dark:text-gray-300">
                                <div className="font-extrabold">이름/나이</div>
                                <div className="font-extrabold">희망지역</div>
                                <div className="font-extrabold">자기소개</div>
                                <div className="font-extrabold">등록일</div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-gray-50 dark:divide-gray-700">
                                {[
                                    { name: '김지O', age: '22세', region: '서울 강남구', intro: '밝고 긍정적인 에너지! 성실하게...', time: '방금 전' },
                                    { name: '이소O', age: '25세', region: '인천 연수구', intro: '경력 2년, 센스 만점! 즉시 출근 ...', time: '5분 전' },
                                    { name: '박민O', age: '21세', region: '경기 분당구', intro: '초보지만 배우는 속도가 빠릅니...', time: '12분 전' },
                                    { name: '최혜O', age: '24세', region: '서울 서초구', intro: '평일 오후 파트타임 구합니다. ...', time: '30분 전' },
                                    { name: '정유O', age: '23세', region: '부산 해운대구', intro: '주말 고정 알바 찾고 있어요. 할...', time: '1시간 전' },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            if (!isLoggedIn) {
                                                router.push('/?page=login');
                                            } else {
                                                router.push('/talent'); // Or relevant page
                                            }
                                        }}
                                        className="grid grid-cols-4 p-5 items-center text-center hover:bg-purple-50/10 transition-colors cursor-pointer group"
                                    >
                                        <div className="font-black text-gray-900 dark:text-white text-sm md:text-[15px]">
                                            {item.name} <span className="font-medium text-gray-400 text-xs ml-0.5">({item.age})</span>
                                        </div>
                                        <div className="font-bold text-gray-700 dark:text-gray-300 text-xs md:text-sm">
                                            {item.region}
                                        </div>
                                        <div className="text-gray-400 text-xs md:text-sm truncate px-4 font-medium group-hover:text-purple-500 transition-colors">
                                            {item.intro}
                                        </div>
                                        <div className="text-gray-400/80 text-xs font-medium">
                                            {item.time}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal */}
            <JobDetailModal shop={selectedShop} onClose={() => setSelectedShop(null)} />

            <PaymentPopup
                isOpen={showPaymentPopup}
                onClose={() => setShowPaymentPopup(false)}
                initialTier={targetTier}
            />

            {/* Footer */}
            {/* Footer */}
            <Footer />
        </div>
    );
}
