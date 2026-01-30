'use client';

import { useBrand } from '@/components/BrandProvider';
import { useLocation } from '@/hooks/useLocation';
import { REGIONS_MAP, REGION_LIST } from '../constants/regions';
import { Crown, Flame, Home, MessageCircle, MessageSquare, Pencil, PlusCircle, ShoppingBag, User, Siren, AlertTriangle, Lock, ThumbsUp, Apple, Sparkles, Moon, ArrowRight, CheckCircle2, ShieldCheck, X, Phone, AlertCircle, Briefcase, Scale, Gift, Trophy, PlusSquare, FileText, Megaphone, Users, ChevronLeft, ChevronRight, MapPin, Star, Zap, Search } from 'lucide-react';
import { JOB_CATEGORY_MAP, JOB_CATEGORIES } from '@/constants/jobs';
import Link from 'next/link';
import { MOCK_POSTS } from '@/constants/community';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import EventPopup from '@/components/EventPopup';
import RightSidebar from '@/components/RightSidebar';
import LeftSidebar from '@/components/LeftSidebar';
import shopsData from '@/lib/data/shops.json';
import regionsData from '@/lib/data/regions.json';

interface Shop {
  name: string;
  realName?: string;
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
  recommended?: boolean;
  tier?: 'grand' | 'premium' | 'deluxe' | 'special' | 'urgent' | 'recommended' | 'native' | 'common' | 'basic';
  updatedAt?: string;
  options?: {
    blink?: boolean;
    bold?: boolean;
    color?: string;
    icons?: string[];
  }
}


const REGION_BANNERS = [
  { id: 1, title: '터치 없음 순수 테이블', desc: 'NO 터치 가라오케 티시 16만원 지급', brand: 'SEOUL 강남별', color: 'bg-gray-900', text: 'text-amber-400' },
  { id: 2, title: '최고의 근무 환경', desc: '깔끔한 시설과 최고의 대우', brand: '역삼 더킹', color: 'bg-indigo-900', text: 'text-white' },
  { id: 3, title: '비즈니스 룸 전문', desc: '확실한 손님 층 보장', brand: '선릉 오션', color: 'bg-pink-900', text: 'text-pink-200' },
  { id: 4, title: '고수익 단기 알바', desc: '당일 지급 원칙 준수', brand: '논현 스타', color: 'bg-purple-900', text: 'text-purple-300' },
  { id: 5, title: '주말 특별 모집', desc: '주말 근무자 특별 보너스 지급', brand: '청담 루이', color: 'bg-slate-800', text: 'text-blue-300' },
];

const JOB_TYPES = ['룸알바', '노래주점', '텐프로/쩜오', '요정', '바(Bar)', '엔터', '다방', '카페', '마사지', '기타'];

export default function HomePortal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brand = useBrand();
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Strict initial state detection
  const [currentPage, _setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const page = new URLSearchParams(window.location.search).get('page');
      return page || 'home';
    }
    return 'home';
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Stable random number generator
  const getStableNumber = useCallback((seed: string, min: number, max: number) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const range = max - min;
    return Math.abs(hash % range) + min;
  }, []);

  // History Management
  const setCurrentPage = useCallback((page: string) => {
    _setCurrentPage(page);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
      window.dispatchEvent(new CustomEvent('sidebar-warp'));
    });
    if (page !== 'home') {
      window.history.pushState({ page }, '', `?page=${page}`);
    } else {
      window.history.pushState({ page: 'home' }, '', '/');
    }
  }, []);

  // Signup States
  const [signupStep, setSignupStep] = useState(1); // 1: Terms, 2: Form, 3: Complete
  const [signupType, setSignupType] = useState<'individual' | 'corporate'>('individual'); // individual: 구직자, corporate: 구인자
  const [agreements, setAgreements] = useState({ terms: false, privacy: false });
  const [businessLicense, setBusinessLicense] = useState<File | null>(null); // 사업자등록증 파일
  const [businessLicenseNumber, setBusinessLicenseNumber] = useState(''); // 사업자등록번호

  // Simulation: Registered business numbers
  const REGISTERED_BUSINESS_NUMBERS = ['123-45-67890', '226-13-91078'];

  // URL Parameter Handling
  useEffect(() => {
    const page = searchParams.get('page');
    if (page === 'signup') {
      _setCurrentPage('signup');
      setSignupStep(1);
    } else if (page === 'region') {
      _setCurrentPage('region');
    } else if (page === 'login') {
      _setCurrentPage('login');
    } else if (page === 'payment') {
      _setCurrentPage('payment');
    }
  }, [searchParams]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const page = event.state?.page || 'home';
      _setCurrentPage(page);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedSubRegion, setSelectedSubRegion] = useState('전체');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedJobType, setSelectedJobType] = useState('전체');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [bannerIndex, setBannerIndex] = useState(0);
  const [activeRegionTab, setActiveRegionTab] = useState('region'); // 'notice', 'industry', 'region', 'today'

  // Banner Auto Scroll
  useEffect(() => {
    if (currentPage === 'region') {
      const interval = setInterval(() => {
        setBannerIndex(prev => (prev + 1) % REGION_BANNERS.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentPage]);

  const [visibleCount, setVisibleCount] = useState(10);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage
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

  // [핵심] 원본 데이터(shops.json)를 7단계 등급 체계로 변환 및 매핑
  const processedShopsWithTiers = useMemo(() => {
    return (shopsData as Shop[]).map((shop, index) => {
      // 이미 tier가 정의되어 있다면 유지하되, 구 체계는 새 체계로 변환
      let tier: Shop['tier'] = shop.tier || 'common';
      if (tier === 'basic') tier = 'common';

      // 섹션이 비어 보이는 것을 방지하기 위해 데이터 인덱스 기반으로 강제 분배 (샘플링)
      if (tier === 'common') {
        if (index % 100 === 5) tier = 'deluxe';
        else if (index % 100 === 10) tier = 'special';
        else if (index % 100 === 15) tier = 'urgent';
        else if (index % 100 === 20) tier = 'recommended';
        else if (index % 100 === 25) tier = 'native';
      }

      // grand 중 일부를 premium으로 배분
      if (tier === 'grand' && index % 3 === 1) tier = 'premium';

      return { ...shop, tier };
    });
  }, []);

  const [shops] = useState<Shop[]>(processedShopsWithTiers);
  const [regions] = useState<string[]>(regionsData as string[]);
  const userLocation = useLocation();

  // 지역 기반 필터링 및 정렬 로직 (국내 최초 핵심 엔진)
  const filteredShops = useMemo(() => {
    let list = [...shops];

    // 0. 직종 필터링
    if (selectedJobType !== '전체') {
      list = list.filter(shop => shop.workType === selectedJobType);
    } else if (selectedCategory !== '전체') {
      const validTypes = JOB_CATEGORY_MAP[selectedCategory] || [];
      list = list.filter(shop => validTypes.includes(shop.workType) || shop.workType === selectedCategory);
    }

    // 1. 지역 필터링
    if (selectedRegion !== '전체') {
      list = list.filter(shop => shop.region.includes(selectedRegion));
      if (selectedSubRegion !== '전체') {
        list = list.filter(shop => shop.region.includes(selectedSubRegion));
      }
    }

    // 2. [줄광고 전용 필터링]
    // 1~6번 광고는 상단 독립 섹션에 배치되므로 중복 노출을 피하기 위해 common만 추출
    const sorted = list.filter(shop => shop.tier === 'common').sort((a, b) => {
      // 점프 정보 기반 최신순 정렬
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

    return sorted;
  }, [selectedRegion, selectedSubRegion, userLocation, shops]);

  const primaryStyle = { color: brand.primaryColor };
  const primaryBgStyle = { backgroundColor: brand.primaryColor };

  return (
    <div className={`w-full max-w-full min-h-screen relative pb-20 overflow-x-hidden`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${brand.theme === 'dark' ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-md shadow-sm transition-all border-b ${brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="max-w-[1020px] mx-auto px-3 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setCurrentPage('home')}>
            {currentPage !== 'home' ? (
              <ChevronLeft className="md:hidden mr-1" size={24} />
            ) : null}
            <span className="text-xl sm:text-2xl font-black tracking-tighter">
              {brand.displayName.split(' ')[0]}
              <span style={primaryStyle} className="ml-1">
                {brand.displayName.split(' ').slice(1).join(' ')}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="text-xs sm:text-sm text-gray-500 hover:text-gray-900 whitespace-nowrap" onClick={() => setCurrentPage('login')}>로그인</button>
            <button
              style={primaryBgStyle}
              className="text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-md hover:opacity-90 transition flex items-center gap-1 whitespace-nowrap"
              onClick={() => setCurrentPage('payment')}
            >
              <Pencil size={12} className="sm:w-[14px] sm:h-[14px]" />
              <span className="hidden sm:inline">사장님 무료등록</span>
              <span className="sm:hidden">무료등록</span>
            </button>
          </div>
        </div>
      </header>

      {/* ... skipping to footer ... */}

      {/* Footer */}
      <main className="w-full">
        {!isMounted ? (
          <div className="min-h-screen bg-white md:bg-gray-50 flex items-center justify-center">
            {/* Simple invisible placeholder to prevent flashes */}
          </div>
        ) : (
          <>
            {currentPage === 'home' && (
              <div className="page-home">
                {/* Event Popup */}
                <EventPopup brand={brand} />

                {/* 롤링 배너 */}
                <div className="bg-gray-900 h-64 md:h-80 relative overflow-hidden flex items-center justify-center text-white text-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80 z-0"></div>
                  <div className="relative z-10 px-4">
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold mb-2 inline-block animate-pulse">GRAND OPEN</span>
                    <h2 className="text-2xl md:text-5xl font-bold mb-4 break-keep">사장님! <span style={primaryStyle} className="whitespace-nowrap">3개월 광고 무료</span> 이벤트</h2>
                    <p className="text-base md:text-lg text-gray-200 mb-8 break-keep">지금 가입하면 <span className="whitespace-nowrap">유료 상품 300만원 상당이 0원!</span></p>
                    <div className="flex gap-3 md:gap-4 justify-center">
                      <button
                        className="bg-white text-black px-10 md:px-12 py-3 rounded-full font-bold hover:bg-gray-200 transition whitespace-nowrap"
                        onClick={() => setCurrentPage('payment')}
                      >
                        무료로 광고 올리기
                      </button>
                    </div>
                  </div>
                </div>

                <div className="max-w-[1020px] mx-auto px-3 py-6 sm:py-8">
                  {/* Quick Icon Grid - Perfect 9 alignment */}
                  <div className="grid grid-cols-3 md:grid-cols-9 gap-3 md:gap-4 mb-10">
                    {[
                      { label: '업종별채용', icon: <Briefcase />, bg: 'bg-purple-100', color: 'text-purple-600', link: 'home' },
                      { label: '지역별 채용', icon: <Home />, bg: 'bg-blue-100', color: 'text-blue-600', link: 'home' },
                      { label: '인재정보', icon: <User />, bg: 'bg-teal-100', color: 'text-teal-600', link: 'login' },
                      { label: '프리미엄 라운지', icon: <Moon />, bg: 'bg-indigo-100', color: 'text-indigo-600', link: 'community' },
                      { label: '같이일할단짝', icon: <Users />, bg: 'bg-pink-100', color: 'text-pink-600', link: 'community' },
                      { label: '밤문화 톡', icon: <Siren />, bg: 'bg-red-100', color: 'text-red-500', link: 'community' },
                      { label: '무료법률자문', icon: <Scale />, bg: 'bg-gray-100', color: 'text-gray-600', link: 'community' },
                      { label: '광고문의', icon: <Megaphone />, bg: 'bg-slate-100', color: 'text-slate-600', link: 'home' },
                      { label: '공지 및 이벤트', icon: <Gift />, bg: 'bg-rose-100', color: 'text-rose-500', link: 'home' },
                    ].map((item, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          if (item.label === '지역별 채용') {
                            setCurrentPage('region');
                          } else if (item.label === '업종별채용') {
                            router.push('/jobs');
                          } else if (item.label === '무료법률자문') {
                            router.push('/community?category=무료법률상담');
                          } else if (item.label === '같이일할단짝') {
                            router.push('/community?category=같이일할단짝');
                          } else if (item.label === '프리미엄 라운지') {
                            router.push('/community?category=프리미엄 라운지');
                          } else if (item.label === '밤문화 톡') {
                            router.push('/community?category=밤 문화 Talk');
                          } else if (item.link === 'community') {
                            router.push('/community');
                          } else if (item.label === '광고문의') {
                            router.push('/customer-center?tab=ad');
                          } else if (item.label === '공지 및 이벤트') {
                            router.push('/customer-center?tab=notice');
                          } else {
                            setCurrentPage(item.link);
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-2xl cursor-pointer hover:scale-105 transition-transform border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-stone-100 shadow-sm'}`}
                      >
                        <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full mb-1.5 sm:mb-2 flex items-center justify-center ${item.bg} ${item.color}`}>
                          {item.icon}
                        </div>
                        <span className={`text-[10px] sm:text-xs font-black text-center break-keep ${brand.theme === 'dark' ? 'text-gray-200' : 'text-gray-950'}`}>{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Dashboard (PC/Mobile 2-Columns) */}
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 mb-10">
                    <div onClick={() => router.push('/community')} className={`border p-3.5 sm:p-6 rounded-[28px] sm:rounded-[32px] shadow-sm cursor-pointer hover:shadow-md transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-pink-100'}`}>
                      <div className="flex justify-between items-center mb-3 sm:mb-5">
                        <span className="font-extrabold text-pink-600 flex items-center gap-1.5 sm:gap-2.5 text-sm sm:text-lg"><MessageSquare size={18} /> 커뮤니티</span>
                        <span className={`text-[9px] sm:text-[11px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full hidden sm:block ${brand.theme === 'dark' ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-50 text-gray-400'}`}>자유게시판</span>
                      </div>
                      <div className="space-y-2.5 sm:space-y-4">
                        {MOCK_POSTS.slice(0, 3).map(post => (
                          <div key={post.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                              <span className={`shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center text-[10px] sm:text-[12px] group-hover:bg-pink-600 group-hover:text-white transition-all ${brand.theme === 'dark' ? 'bg-pink-900/10' : 'bg-pink-50'}`}>
                                {post.category === '친구찾기' ? '👥' : post.category === '블랙리스트' ? '🚨' : '💬'}
                              </span>
                              <p className={`truncate text-[11px] sm:text-[13px] font-black ${brand.theme === 'dark' ? 'text-gray-100' : 'text-black'}`}>
                                {post.title}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 실시간 공지사항 */}
                    <div onClick={() => router.push('/customer-center?tab=notice')} className={`border p-3.5 sm:p-6 rounded-[28px] sm:rounded-[32px] shadow-sm cursor-pointer hover:shadow-md transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
                      <div className="flex justify-between items-center mb-3 sm:mb-5">
                        <span className="font-extrabold text-blue-600 flex items-center gap-1.5 sm:gap-2.5 text-sm sm:text-lg"><Megaphone size={18} /> 공지사항</span>
                        <span className={`text-[9px] sm:text-[11px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full hidden sm:block ${brand.theme === 'dark' ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-50 text-gray-400'}`}>업데이트</span>
                      </div>
                      <div className="space-y-2.5 sm:space-y-4">
                        {[
                          { title: '[중요] 서비스 전면 개편 및 광고 상품 단가 확정 안내', isNew: true },
                          { title: 'PC 사이드배너 광고 시스템 정식 도입', isNew: false },
                          { title: '브랜드 통합 시스템 리뉴얼 안내', isNew: false }
                        ].map((n, i) => (
                          <div key={i} className={`flex items-center justify-between gap-2 sm:gap-3 border-b pb-2 sm:pb-2.5 last:border-0 last:pb-0 ${brand.theme === 'dark' ? 'border-gray-700/50' : 'border-gray-50'}`}>
                            <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                              <div className={`shrink-0 w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full ${n.isNew ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'}`}></div>
                              <p className={`truncate text-[11px] sm:text-[13px] font-black ${brand.theme === 'dark' ? 'text-gray-100' : 'text-black'}`}>{n.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 광고 영역 (그랜드 / 프리미엄) */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center gap-2 text-xl font-bold">
                      <Crown size={20} className="text-amber-500" fill="currentColor" />
                      <span>그랜드 / 프리미엄</span>
                    </h3>
                    <button
                      onClick={() => router.push('/customer-center?tab=ad')}
                      className={`text-[10px] sm:text-[11px] font-black border px-3 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all flex items-center gap-1 active:scale-95 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'}`}
                    >
                      <PlusCircle size={12} className="text-pink-500" />
                      광고신청 +
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {shops.filter(s => s.tier === 'grand' || s.tier === 'premium').slice(0, 8).map((shop, i) => {
                      const tierConfig: Record<string, { bg: string; label: string }> = {
                        grand: { bg: 'bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-400', label: '그랜드' },
                        premium: { bg: 'bg-gradient-to-br from-purple-600 via-pink-500 to-rose-400', label: '프리미엄' },
                      };
                      const tier = tierConfig[shop.tier || 'grand'] || tierConfig.grand;
                      const views = getStableNumber(shop.id || i.toString(), 50, 450);
                      const rank = i + 1;
                      return (
                        <div
                          key={`grand-${shop.id || i}`}
                          onClick={() => setSelectedShop(shop)}
                          className={`group relative rounded-2xl overflow-hidden shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${tier.bg}`}
                        >
                          {/* 상단 등급 배지 */}
                          <div className="absolute top-2 left-2 z-10">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black text-white ${shop.tier === 'grand' ? 'bg-amber-600' : 'bg-purple-600'} shadow-sm`}>
                              {tier.label}
                            </span>
                          </div>
                          {/* 중앙 아이콘 영역 */}
                          <div className="h-24 md:h-28 flex items-center justify-center relative">
                            <Crown className="text-white/40" size={40} />
                            {/* 순위/조회수 배지 */}
                            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-2 py-1 rounded-full font-bold backdrop-blur-sm">
                              {rank}위 | {views}회
                            </span>
                          </div>
                          {/* 하단 정보 영역 */}
                          <div className={`p-3 ${brand.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                            <h4 className={`text-[13px] font-black truncate mb-0.5 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                              {shop.name}
                            </h4>
                            <p className="text-[10px] text-gray-500 truncate mb-1">
                              {shop.region.split(' ').slice(0, 2).join(' ')}
                            </p>
                            <p className="text-[12px] font-bold text-pink-600 truncate">
                              {shop.pay || '급여 협의'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>


                  {/* 디럭스 채용정보 섹션 */}
                  <div className="mb-14">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`flex items-center gap-2 text-xl font-black ${brand.theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                        <Zap size={20} className="text-blue-500" />
                        <span>디럭스 채용 정보</span>
                      </h3>
                      <button
                        onClick={() => router.push('/customer-center?tab=ad')}
                        className={`text-[10px] sm:text-[11px] font-black border px-3 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all flex items-center gap-1 active:scale-95 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'}`}
                      >
                        <PlusCircle size={12} className="text-blue-500" />
                        광고신청 +
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {shops.filter(s => s.tier === 'deluxe').slice(0, 8).map((shop, i) => {
                        const views = getStableNumber(shop.id || i.toString(), 50, 400);
                        const rank = i + 1;
                        return (
                          <div
                            key={`deluxe-${shop.id || i}`}
                            onClick={() => setSelectedShop(shop)}
                            className="group relative rounded-2xl overflow-hidden shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl cursor-pointer bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400"
                          >
                            {/* 상단 등급 배지 */}
                            <div className="absolute top-2 left-2 z-10">
                              <span className="px-2 py-0.5 rounded text-[9px] font-black text-white bg-blue-700 shadow-sm">
                                디럭스
                              </span>
                            </div>
                            {/* 중앙 아이콘 영역 */}
                            <div className="h-24 md:h-28 flex items-center justify-center relative">
                              <Zap className="text-white/40" size={40} />
                              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-2 py-1 rounded-full font-bold backdrop-blur-sm">
                                {rank}위 | {views}회
                              </span>
                            </div>
                            {/* 하단 정보 영역 */}
                            <div className={`p-3 ${brand.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                              <h4 className={`text-[13px] font-black truncate mb-0.5 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                {shop.name}
                              </h4>
                              <p className="text-[10px] text-gray-500 truncate mb-1">
                                {shop.region.split(' ').slice(0, 2).join(' ')}
                              </p>
                              <p className="text-[12px] font-bold text-blue-600 truncate">
                                {shop.pay || '급여 협의'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 스페셜 채용정보 섹션 */}
                  <div className="mb-14">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`flex items-center gap-2 text-xl font-black ${brand.theme === 'dark' ? 'text-pink-400' : 'text-pink-700'}`}>
                        <Sparkles size={20} className="text-pink-500" />
                        <span>스페셜 채용 정보</span>
                      </h3>
                      <button
                        onClick={() => router.push('/customer-center?tab=ad')}
                        className={`text-[10px] sm:text-[11px] font-black border px-3 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all flex items-center gap-1 active:scale-95 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'}`}
                      >
                        <PlusCircle size={12} className="text-pink-500" />
                        광고신청 +
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {shops.filter(s => s.tier === 'special').slice(0, 8).map((shop, i) => {
                        const views = getStableNumber(shop.id || i.toString(), 50, 350);
                        const rank = i + 1;
                        return (
                          <div
                            key={`special-${shop.id || i}`}
                            onClick={() => setSelectedShop(shop)}
                            className="group relative rounded-2xl overflow-hidden shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl cursor-pointer bg-gradient-to-br from-pink-500 via-rose-500 to-red-400"
                          >
                            {/* 상단 등급 배지 */}
                            <div className="absolute top-2 left-2 z-10">
                              <span className="px-2 py-0.5 rounded text-[9px] font-black text-white bg-pink-700 shadow-sm">
                                스페셜
                              </span>
                            </div>
                            {/* 중앙 아이콘 영역 */}
                            <div className="h-24 md:h-28 flex items-center justify-center relative">
                              <Sparkles className="text-white/40" size={40} />
                              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-2 py-1 rounded-full font-bold backdrop-blur-sm">
                                {rank}위 | {views}회
                              </span>
                            </div>
                            {/* 하단 정보 영역 */}
                            <div className={`p-3 ${brand.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                              <h4 className={`text-[13px] font-black truncate mb-0.5 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                {shop.name}
                              </h4>
                              <p className="text-[10px] text-gray-500 truncate mb-1">
                                {shop.region.split(' ').slice(0, 2).join(' ')}
                              </p>
                              <p className="text-[12px] font-bold text-pink-600 truncate">
                                {shop.pay || '급여 협의'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 급구 및 추천채용 통합 섹션 */}
                  <div className="mb-16">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className={`flex items-center gap-2 text-xl font-black ${brand.theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
                        <Flame size={20} className="text-red-500" />
                        <span>급구 / 추천 채용</span>
                      </h3>
                      <button
                        onClick={() => router.push('/customer-center?tab=ad')}
                        className={`text-[10px] sm:text-[11px] font-black border px-3 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all flex items-center gap-1 active:scale-95 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'}`}
                      >
                        <PlusCircle size={12} className="text-red-500" />
                        광고신청 +
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {shops.filter(s => s.tier === 'urgent' || s.tier === 'recommended' || s.recommended).slice(0, 8).map((shop, i) => {
                        const isUrgent = shop.tier === 'urgent';
                        const views = getStableNumber(shop.id || i.toString(), 50, 300);
                        const rank = i + 1;
                        return (
                          <div
                            key={`urgent-${shop.id || i}`}
                            onClick={() => setSelectedShop(shop)}
                            className={`group relative rounded-2xl overflow-hidden shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl cursor-pointer ${isUrgent ? 'bg-gradient-to-br from-red-500 via-orange-500 to-amber-400' : 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-400'}`}
                          >
                            {/* 상단 등급 배지 */}
                            <div className="absolute top-2 left-2 z-10">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black text-white shadow-sm ${isUrgent ? 'bg-red-700' : 'bg-emerald-700'}`}>
                                {isUrgent ? '급구' : '추천'}
                              </span>
                            </div>
                            {/* 중앙 아이콘 영역 */}
                            <div className="h-24 md:h-28 flex items-center justify-center relative">
                              {isUrgent ? <Flame className="text-white/40" size={40} /> : <Gift className="text-white/40" size={40} />}
                              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-2 py-1 rounded-full font-bold backdrop-blur-sm">
                                {rank}위 | {views}회
                              </span>
                            </div>
                            {/* 하단 정보 영역 */}
                            <div className={`p-3 ${brand.theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                              <h4 className={`text-[13px] font-black truncate mb-0.5 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                {shop.name}
                              </h4>
                              <p className="text-[10px] text-gray-500 truncate mb-1">
                                {shop.region.split(' ').slice(0, 2).join(' ')}
                              </p>
                              <p className={`text-[12px] font-bold truncate ${isUrgent ? 'text-red-600' : 'text-emerald-600'}`}>
                                {shop.pay || '급여 협의'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* 줄광고 리스트 */}
                  <div id="job-list-section" className="mt-1">
                    <div className="flex items-center justify-between mb-5 w-full">
                      <h2 className={`text-xl font-bold flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <MapPin size={22} className="text-pink-500" />
                        <span>최신 구인정보</span>
                        <span className="bg-rose-100 text-rose-600 text-[9px] px-2 py-0.5 rounded-full font-black animate-bounce uppercase">Live</span>
                      </h2>
                      <div className="pr-[32px]">
                        <Link href="/favorites" className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:underline">
                          <Star size={14} fill="currentColor" />
                          내 보관함
                        </Link>
                      </div>
                    </div>

                    <div className={`rounded-2xl border shadow-sm overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
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
                            {filteredShops.length > 0 ? (
                              filteredShops.slice(0, visibleCount).map((shop, i) => {
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
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                          {shop.tier && shop.tier !== 'common' && (
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${shop.tier === 'grand' ? 'bg-amber-100 text-amber-600 border border-amber-200' : shop.tier === 'special' ? 'bg-purple-100 text-purple-600 border border-purple-200' : shop.tier === 'premium' ? 'bg-blue-100 text-blue-600 border border-blue-200' : shop.tier === 'urgent' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-600'}`}>
                                              {shop.tier === 'grand' ? '그랜드' : shop.tier === 'premium' ? '프리미엄' : shop.tier === 'deluxe' ? '디럭스' : shop.tier === 'special' ? '스페셜' : shop.tier === 'urgent' ? '급구' : shop.tier === 'recommended' ? '추천' : shop.tier === 'native' ? '네이티브' : '일반'}
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
                                          {shop.options?.blink && <span className="bg-red-500 text-white text-[9px] px-1 rounded-sm font-black shrink-0">급구</span>}
                                          <span className={`truncate font-bold ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {shop.name}에서 함께 일할 가족을 모집합니다. {shop.name}에서 최고의 대우를 약속드립니다.
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-3 py-4 text-right pr-[31px]">
                                        <div className="flex items-center justify-end gap-1.5 select-none">
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
                                      <tr className="bg-amber-50/50 border-y border-amber-100/50">
                                        <td colSpan={6} className="pl-6 py-5 pr-[31px]">
                                          <div className="flex items-center justify-between pointer-events-auto">
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
                          {filteredShops.length > 0 ? (
                            filteredShops.slice(0, visibleCount).map((shop, i) => {
                              const isFav = favorites.includes(shop.id);
                              return (
                                <React.Fragment key={shop.id || i}>
                                  <div
                                    onClick={() => setSelectedShop(shop)}
                                    className={`p-4 active:bg-gray-50 transition-colors flex justify-between items-start gap-3 ${brand.theme === 'dark' ? 'bg-gray-900 active:bg-gray-800' : 'bg-white'}`}
                                  >
                                    <div className="flex-1 min-w-0">
                                      {/* Top: Bold Title (모집내용) */}
                                      <h3 className={`text-[15px] font-bold mb-1.5 break-keep line-clamp-1 truncate ${brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                                        {shop.options?.blink && <span className="text-red-500 mr-1">♥</span>}
                                        {shop.name}에서 함께 일할 가족을 모집합니다.
                                      </h3>
                                      {/* Bottom: [Shop Name] | [Region] | [Pay] */}
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

                    {visibleCount < filteredShops.length && (
                      <button
                        onClick={() => setVisibleCount(prev => prev + 10)}
                        className="w-full mt-6 py-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 font-bold text-sm hover:bg-gray-50 transition-colors"
                      >
                        공고 더보기 ({filteredShops.length - visibleCount}개 남음)
                      </button>
                    )}

                    {filteredShops.length === 0 && (
                      <div className="text-center py-20 text-gray-400 text-sm">
                        해당 지역의 공고가 없습니다.
                      </div>
                    )}

                    {/* 인재 정보 섹션 (퀸알바/레이디알바 벤치마킹 핵심) */}
                    <div className="mt-16 mb-12">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className={`flex items-center gap-2 text-xl font-bold ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                          <User size={22} className="text-rose-500" />
                          <span>실시간 인재 발굴</span>
                          <span className="text-xs font-normal text-gray-400 ml-2 hidden sm:inline">언니들이 사장님을 기다리고 있어요!</span>
                        </h3>
                        <div className="pr-8 translate-x-[2px]">
                          <Link href="/lounge" className="text-xs text-blue-500 font-bold hover:underline flex items-center gap-0.5 transition-all">
                            인재 전체보기 <ChevronRight size={14} className="translate-x-[2px]" />
                          </Link>
                        </div>
                      </div>

                      <div className={`rounded-3xl border shadow-xl overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[10px] sm:text-sm table-fixed">
                            <thead className={`border-b ${brand.theme === 'dark' ? 'bg-gray-900/80 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                              <tr>
                                <th className="w-1/4 px-2 sm:px-6 py-4 font-black text-center whitespace-nowrap">이름/나이</th>
                                <th className="w-1/4 px-2 sm:px-6 py-4 font-black text-center whitespace-nowrap">희망지역</th>
                                <th className="w-1/4 px-2 sm:px-6 py-4 font-black text-center whitespace-nowrap">자기소개</th>
                                <th className="w-1/4 px-2 sm:px-6 py-4 font-black text-center whitespace-nowrap">등록일</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${brand.theme === 'dark' ? 'divide-gray-800' : 'divide-gray-50'}`}>
                              {[
                                { name: '김지O', age: '22세', region: '서울 강남구', desc: '밝고 긍정적인 에너지! 성실하게 일하겠습니다.', date: '방금 전' },
                                { name: '이소O', age: '25세', region: '인천 연수구', desc: '경력 2년, 센스 만점! 즉시 출근 가능합니다.', date: '5분 전' },
                                { name: '박민O', age: '21세', region: '경기 분당구', desc: '초보지만 배우는 속도가 빠릅니다. 연락주세요!', date: '12분 전' },
                                { name: '최혜O', age: '24세', region: '서울 서초구', desc: '평일 오후 파트타임 구합니다. 약속 잘 지킵니다.', date: '30분 전' },
                                { name: '정유O', age: '23세', region: '부산 해운대구', desc: '주말 고정 알바 찾고 있어요. 활발한 성격입니다.', date: '1시간 전' },
                              ].map((person, idx) => (
                                <tr key={idx} className={`transition-colors cursor-pointer group ${brand.theme === 'dark' ? 'hover:bg-rose-900/20' : 'hover:bg-rose-50/50'}`}>
                                  <td className="w-1/4 px-2 sm:px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`font-black group-hover:text-rose-600 ${brand.theme === 'dark' ? 'text-gray-100' : 'text-black'}`}>{person.name}</span>
                                    <span className="text-gray-500 ml-1 text-[9px] sm:text-xs font-bold">({person.age})</span>
                                  </td>
                                  <td className={`w-1/4 px-2 sm:px-6 py-4 font-black whitespace-nowrap text-center truncate ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-900'}`}>{person.region}</td>
                                  <td className="w-1/4 px-2 sm:px-6 py-4 text-gray-500 text-[10px] sm:text-sm truncate text-center">{person.desc}</td>
                                  <td className="w-1/4 px-2 sm:px-6 py-4 text-center text-gray-400 font-extrabold whitespace-nowrap text-[10px] sm:text-[11px]">{person.date}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

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
                        <h2 className="text-xl font-black mb-1 break-keep leading-snug">{selectedShop.realName || selectedShop.name}</h2>
                        <p className="text-white/80 text-xs">{selectedShop.region} | {selectedShop.workType}</p>
                        {selectedShop.tier === 'grand' && <div className="mt-2 inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold">✨ Premium Verified</div>}
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                            <p className="text-xs text-gray-400 mb-1">시급/일급</p>
                            <p className="text-red-500 font-bold text-sm">{selectedShop.pay}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                            <p className="text-xs text-gray-400 mb-1">근무형태</p>
                            <p className="text-black font-bold text-sm">{selectedShop.workType}</p>
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
                        <p className="text-[10px] text-gray-400">{brand.name}를 통해 연락했다고 말씀해주세요!</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
            }

            {
              currentPage === 'payment' && (
                <div className="max-w-2xl mx-auto px-4 py-8">
                  <div className={`p-6 md:p-8 rounded-2xl shadow-lg border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} style={{ borderColor: brand.primaryColor }}>
                    <h2 className="text-2xl font-bold mb-2 text-center">사장님 전용 상품 안내</h2>
                    <div className="bg-red-50 text-red-600 text-center text-sm p-2 rounded mb-6 font-bold">
                      🎉 오픈 기념 선착순 100업소 3개월 무료 체험 진행 중!
                    </div>

                    <div className="space-y-3 mb-8">
                      {[
                        { id: 1, name: '1번 - 그랜드 (Grand)', desc: '메인/지역 최상단 0순위 독점 노출 (Glow 효과)', price: '350,000원' },
                        { id: 2, name: '2번 - 프리미엄 (Premium)', desc: '메인 상단 전략적 고정 (보라색 보더 적용)', price: '200,000원' },
                        { id: 3, name: '3번 - 디럭스 (Deluxe)', desc: '메인 중앙 집중 노출 (블루 보더 적용)', price: '150,000원' },
                        { id: 4, name: '4번 - 스페셜 (Special)', desc: '리스트 상단 핑크 보더 노출 (관심 집중)', price: '120,000원' },
                        { id: 5, name: '5번 - 급구/추천 (Urgent/Rec)', desc: '빨간 제목 + 추천 배지로 가독성 극대화', price: '100,000원' },
                        { id: 6, name: '6번 - 네이티브 (Native)', desc: '일반 리스트 노출 (네이티브 스타일)', price: '80,000원' },
                        { id: 7, name: '7번 - 베이직/줄광고 (Basic)', desc: '일반 리스트 노출 (실속형 구인 상품)', price: '60,000원' },
                        { id: 8, name: '8번 - 강조옵션 (Emphasis)', desc: '아이콘/형광펜 효과 (주목도 200% 상승)', price: '30,000원' },
                      ].map((pkg) => (
                        <label key={pkg.id} className={`block p-4 border rounded-xl cursor-pointer relative overflow-hidden transition-all hover:border-red-500 hover:bg-red-50/30 ${brand.theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : pkg.id === 1 ? 'border-red-500 bg-red-50/50' : 'border-gray-200 bg-white shadow-sm'}`}>
                          {pkg.id === 1 && <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] px-2 py-0.5 font-bold uppercase tracking-tighter">Event</div>}
                          <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0 pr-3">
                              <span className={`block font-black text-sm md:text-base ${brand.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{pkg.name}</span>
                              <span className="text-[11px] md:text-xs text-gray-500 font-bold truncate block">{pkg.desc}</span>
                            </div>
                            <div className="text-right shrink-0">
                              {pkg.id === 1 && <span className="block text-gray-400 line-through text-[10px] mb-[-2px]">350,000원</span>}
                              <span className={`text-base md:text-lg font-black ${pkg.id === 1 ? 'text-red-500' : (brand.theme === 'dark' ? 'text-gray-200' : 'text-gray-800')}`}>{pkg.id === 1 ? '0원' : pkg.price}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    <button
                      style={primaryBgStyle}
                      className="w-full text-white font-bold py-4 rounded-xl text-lg shadow-md hover:opacity-90 transition"
                      onClick={() => alert('신청이 완료되었습니다! 담당자가 연락드립니다.')}
                    >
                      선택한 상품 신청하기
                    </button>
                  </div>
                </div>
              )
            }

            {
              currentPage === 'community' && (
                <div className="max-w-4xl mx-auto px-4 py-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Siren className="text-red-500" /> 블랙리스트 공유
                  </h2>

                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 flex items-start gap-3 text-red-700">
                    <AlertTriangle className="shrink-0 mt-1" size={18} />
                    <div className="text-sm">
                      <strong>경고:</strong> 진상 손님 정보는 회원끼리만 공유됩니다.<br />
                      허위 사실 유포 시 활동이 정지될 수 있습니다.
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className={`p-4 rounded-lg shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-100 text-black'}`}>
                      <div className="flex justify-between mb-2">
                        <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded">강남/논현</span>
                        <span className="text-xs text-gray-400">2024.01.20</span>
                      </div>
                      <h3 className="font-bold mb-1">010-XXXX-1234 (안경, 40대)</h3>
                      <p className="text-sm text-gray-500 mb-2">술 취하면 물건 던짐. 계산 안하고 도망가려다 걸림. 절대 받지 마세요.</p>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><ThumbsUp size={12} /> 공감 42</span>
                        <span className="flex items-center gap-1"><MessageCircle size={12} /> 댓글 8</span>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg shadow-sm border relative overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                      <div className="blur-sm select-none">
                        <div className="flex justify-between mb-2">
                          <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded">평택/송탄</span>
                          <span className="text-xs text-gray-400">2024.01.19</span>
                        </div>
                        <h3 className="font-bold mb-1">010-XXXX-5678 (문신, 30대)</h3>
                        <p className="text-sm">룸 안에서 몰래 촬영 시도함. 핸드폰 뺏어서 확인했더니...</p>
                      </div>
                      <div className={`absolute inset-0 flex flex-col items-center justify-center ${brand.theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'}`}>
                        <Lock className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="font-bold text-sm">회원가입 후 전체 내용을 확인하세요</p>
                        <button className="mt-2 text-white px-4 py-1.5 rounded text-xs font-bold" style={primaryBgStyle}>3초 회원가입</button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }


            {/* 로그인 페이지 */}
            {
              currentPage === 'login' && (
                <div className="max-w-md mx-auto px-4 py-16">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-black mb-2" style={primaryStyle}>{brand.displayName}</h2>
                    <p className="text-gray-500">더 나은 미래를 위한 첫 걸음</p>
                  </div>
                  <div className="space-y-4">
                    <input type="text" placeholder="아이디" className={`w-full p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} />
                    <input type="password" placeholder="비밀번호" className={`w-full p-4 rounded-xl border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} />
                    <button
                      style={primaryBgStyle}
                      className="w-full text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition"
                      onClick={() => alert('서비스 준비 중입니다!')}
                    >
                      로그인
                    </button>
                    <div className="flex justify-center items-center text-[13px] text-gray-400 mt-4 whitespace-nowrap gap-2 sm:gap-4">
                      <span className="cursor-pointer hover:text-gray-600">아이디 찾기</span>
                      <span className="w-px h-3 bg-gray-200"></span>
                      <span className="cursor-pointer hover:text-gray-600">비밀번호 찾기</span>
                      <span className="w-px h-3 bg-gray-200"></span>
                      <button className="text-gray-600 font-bold hover:underline" onClick={() => setCurrentPage('signup')}>회원가입</button>
                    </div>

                    {/* Social Login */}
                    <div className="mt-8 pt-8 border-t border-gray-100">
                      <p className="text-center text-xs text-gray-400 mb-4">또는 SNS로 간편하게 시작하기</p>
                      <div className="space-y-3">
                        <button
                          className="w-full py-4 rounded-xl bg-[#03C75A] text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition shadow-sm"
                          onClick={() => alert('네이버 로그인 연동 준비 중입니다.')}
                        >
                          <span className="font-black text-lg">N</span> 네이버로 시작하기
                        </button>
                        <button
                          className="w-full py-4 rounded-xl border border-gray-200 bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition shadow-sm"
                          onClick={() => alert('구글 로그인 연동 준비 중입니다.')}
                        >
                          <span className="font-black text-lg text-blue-500">G</span> 구글로 시작하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }

            {/* Region Page (Redesigned) */}
            {currentPage === 'region' && (
              <div className="w-full max-w-[1020px] mx-auto px-0 md:px-4 py-0 md:py-8 min-h-screen bg-gray-50 md:bg-white overflow-x-hidden">

                {/* 1. Hero Banner Carousel */}
                <div className="relative w-full h-[160px] md:h-[180px] bg-gray-900 overflow-hidden md:rounded-3xl mb-0 md:mb-8 group">
                  <div
                    className="flex transition-transform duration-500 ease-in-out h-full"
                    style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
                  >
                    {REGION_BANNERS.map((banner) => (
                      <div key={banner.id} className={`w-full h-full flex-shrink-0 relative ${banner.color}`}>
                        {/* Background Pattern */}
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

                  {/* Arrows */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setBannerIndex((prev) => (prev === 0 ? REGION_BANNERS.length - 1 : prev - 1)); }}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 backdrop-blur-md rounded-full text-white/50 hover:bg-white/20 hover:text-white transition-all border border-white/10"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setBannerIndex((prev) => (prev + 1) % REGION_BANNERS.length); }}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 backdrop-blur-md rounded-full text-white/50 hover:bg-white/20 hover:text-white transition-all border border-white/10"
                  >
                    <ChevronRight size={24} />
                  </button>

                  {/* Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {REGION_BANNERS.map((_, i) => (
                      <div
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setBannerIndex(i); }}
                        className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all cursor-pointer ${i === bannerIndex ? 'bg-white w-4 md:w-6' : 'bg-white/30 hover:bg-white/50'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* 3열 레이아웃: 좌측 사이드바 | 중앙 콘텐츠 */}
                <div className="flex flex-col lg:flex-row gap-0 lg:gap-6">
                  {/* 좌측 사이드바 (PC에서만 표시) */}
                  <LeftSidebar
                    selectedRegion={selectedRegion}
                    setSelectedRegion={setSelectedRegion}
                    setSelectedSubRegion={setSelectedSubRegion}
                    selectedJobType={selectedJobType}
                    setSelectedJobType={setSelectedJobType}
                    selectedKeywords={selectedKeywords}
                    setSelectedKeywords={setSelectedKeywords}
                    onLoginClick={() => setCurrentPage('login')}
                    onSignupClick={() => setCurrentPage('signup')}
                    onPaymentClick={() => setCurrentPage('payment')}
                  />

                  {/* 중앙 콘텐츠 영역 */}
                  <div className="flex-1 px-4 py-6 md:px-0">
                    {/* 2. Page Title Area */}
                    {/* 2. Page Title Area & Notice Bar */}
                    <div className="flex flex-col gap-4 mb-6">
                      <h3 className={`text-2xl md:text-3xl font-black flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        <span className="text-pink-600">|</span> 지역별 채용
                      </h3>

                      {/* Notice Bar (Separated) */}
                      <div
                        onClick={() => router.push('/customer-center?tab=notice')}
                        className={`cursor-pointer flex items-center justify-between px-4 py-3 rounded-xl border transition-all hover:bg-opacity-50 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="bg-pink-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md whitespace-nowrap">공지사항</span>
                          <span className={`text-[12px] md:text-sm font-black truncate ${brand.theme === 'dark' ? 'text-gray-100' : 'text-black'}`}>
                            [안내] 프리미엄 광고 "Grand Tier" 서비스 개편 및 혜택 안내
                          </span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 shrink-0" />
                      </div>

                      {/* 3. Navigation Tabs */}
                      <div className="flex border-b-2 border-gray-100 mt-2">
                        {['업종별채용', '지역별 채용', '오늘본광고'].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => {
                              if (tab === '업종별채용') {
                                router.push('/jobs');
                              } else {
                                setActiveRegionTab(tab === '지역별 채용' ? 'region' : 'other');
                              }
                            }}
                            className={`flex-1 py-3 text-[13px] md:text-sm font-black text-center relative transition-colors ${(tab === '지역별 채용')
                              ? 'text-pink-600 border-b-2 border-pink-600 -mb-0.5'
                              : 'text-gray-400 hover:text-gray-600'
                              }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 4. Search Form Section (Ultra-Compact) */}
                    <div className={`p-3.5 md:p-6 rounded-[20px] md:rounded-[32px] border shadow-sm space-y-2 md:space-y-0 md:flex md:items-center md:gap-3 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>

                      {/* Mobile: Labels (Hidden on Desktop) */}
                      <div className="md:hidden grid grid-cols-1 gap-1">
                        <label className="text-[10px] font-black text-gray-500 pl-1">지역</label>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            className={`w-full p-2.5 rounded-lg text-xs font-bold border appearance-none transition-all cursor-pointer ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-pink-500 focus:bg-white'}`}
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
                            className={`w-full p-2.5 rounded-lg text-xs font-bold border appearance-none transition-all cursor-pointer ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-100 focus:border-blue-500 focus:bg-white'} disabled:opacity-50`}
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

                      {/* Desktop: Region Selects */}
                      <div className="hidden md:flex items-center gap-2 flex-[2]">
                        <select
                          className={`w-full p-3 rounded-xl font-bold text-sm border-2 appearance-none cursor-pointer ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-900 hover:border-pink-200'}`}
                          value={selectedRegion}
                          onChange={(e) => {
                            setSelectedRegion(e.target.value);
                            setSelectedSubRegion('전체');
                          }}
                        >
                          <option value="전체">지역전체</option>
                          {REGION_LIST.map(reg => (
                            <option key={reg} value={reg}>{reg}</option>
                          ))}
                        </select>
                        <select
                          disabled={selectedRegion === '전체'}
                          className={`w-full p-3 rounded-xl font-bold text-sm border-2 appearance-none cursor-pointer disabled:opacity-50 ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-900 hover:border-blue-200'}`}
                          value={selectedSubRegion}
                          onChange={(e) => setSelectedSubRegion(e.target.value)}
                        >
                          <option value="전체">세부지역</option>
                          {selectedRegion !== '전체' && (REGIONS_MAP[selectedRegion] as string[])?.map((sub: string) => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>

                      {/* Job Select */}
                      <div className="grid grid-cols-1 gap-1 md:gap-0 flex-[2] md:flex md:items-center md:gap-2">
                        <label className="md:hidden text-[10px] font-black text-gray-500 pl-1">직종</label>
                        <div className="grid grid-cols-2 gap-2 md:w-full">
                          <select
                            className={`w-full p-2.5 md:p-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold border md:border-2 appearance-none transition-all cursor-pointer ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-pink-500 focus:bg-white md:hover:border-purple-200'}`}
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
                            className={`w-full p-2.5 md:p-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold border md:border-2 appearance-none transition-all cursor-pointer disabled:opacity-50 ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-pink-500 focus:bg-white md:hover:border-purple-200'}`}
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
                      <div className="grid grid-cols-1 gap-1 md:gap-0 flex-[2]">
                        <label className="md:hidden text-[10px] font-black text-gray-500 pl-1">검색어</label>
                        <input
                          type="text"
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          placeholder="키워드 검색 (예: 강남)"
                          className={`w-full p-2.5 md:p-3 rounded-lg md:rounded-xl font-medium text-xs md:text-sm border md:border-2 transition-all ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-100 text-gray-900 placeholder-gray-400 focus:border-pink-500 focus:bg-white md:hover:border-gray-200'}`}
                        />
                      </div>

                      {/* Search Button */}
                      <div className="pt-1 md:pt-0 w-full md:w-auto">
                        <button
                          onClick={() => {
                            setCurrentPage('home');
                            setTimeout(() => {
                              document.getElementById('job-list-section')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }}
                          className="w-full md:w-auto md:px-6 py-3 md:py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-black text-[13px] md:text-sm shadow-md hover:from-black hover:to-black active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <Search size={16} />
                          <span className="md:hidden">검색하기</span>
                          <span className="hidden md:inline">검색</span>
                        </button>
                      </div>
                    </div>


                    {/* 7. 그랜드 프리미엄 헤더 + 더보기/광고신청 버튼 */}
                    <div className="flex items-center justify-between mb-4 mt-8">
                      <h3 className={`text-lg md:text-xl font-black flex items-center gap-2 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        <Star className="text-amber-500" size={20} />
                        그랜드 프리미엄
                      </h3>
                      <div className="flex gap-2">
                        <button className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                          더보기
                        </button>
                        <button
                          onClick={() => setCurrentPage('payment')}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-pink-600 text-white hover:bg-pink-700 transition"
                        >
                          광고신청
                        </button>
                      </div>
                    </div>

                    {/* 8. 구인정보 카드 그리드 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                      {shops
                        .filter(shop => shop.tier && shop.tier !== 'common')
                        .slice(0, 12)
                        .map((shop, idx) => {
                          const tierConfig: Record<string, { bg: string; text: string; label: string }> = {
                            grand: { bg: 'bg-gradient-to-r from-amber-500 to-yellow-400', text: 'text-white', label: '그랜드' },
                            premium: { bg: 'bg-gradient-to-r from-purple-600 to-pink-500', text: 'text-white', label: '프리미엄' },
                            deluxe: { bg: 'bg-gradient-to-r from-blue-600 to-cyan-500', text: 'text-white', label: '디럭스' },
                            special: { bg: 'bg-pink-600', text: 'text-white', label: '스페셜' },
                            urgent: { bg: 'bg-red-600', text: 'text-white', label: '급구' },
                            recommended: { bg: 'bg-emerald-600', text: 'text-white', label: '추천' },
                            native: { bg: 'bg-cyan-600', text: 'text-white', label: '네이티브' },
                            basic: { bg: 'bg-gray-500', text: 'text-white', label: '베이직' },
                          };
                          const tier = tierConfig[shop.tier || 'special'] || tierConfig.special;
                          const views = getStableNumber(shop.id || idx.toString(), 50, 500);
                          const rank = idx + 1;

                          return (
                            <div
                              key={shop.id}
                              onClick={() => setSelectedShop(shop)}
                              className={`rounded-xl overflow-hidden border shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                            >
                              {/* 썸네일 영역 */}
                              <div className={`h-20 md:h-24 ${tier.bg} relative flex items-center justify-center`}>
                                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black ${tier.bg} ${tier.text} shadow-sm`}>
                                  {tier.label}
                                </span>
                                <Crown className="text-white/50" size={32} />
                                <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                                  {rank}위 | {views}회
                                </span>
                              </div>
                              {/* 정보 영역 */}
                              <div className="p-3">
                                <h4 className={`text-[13px] font-black truncate mb-1 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                  {shop.realName || shop.name}
                                </h4>
                                <p className="text-[11px] text-gray-500 truncate mb-1.5">
                                  {shop.region}
                                </p>
                                <p className="text-[12px] font-bold text-pink-600 truncate">
                                  {shop.pay || '급여 협의'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* 광고 카드 - 사장님 한칸 */}
                    <div className="mt-6 p-4 rounded-2xl border-2 border-dashed border-pink-300 bg-pink-50/50 flex items-center justify-between">
                      <div>
                        <h4 className="text-[15px] font-black text-black mb-0.5">사장님, 광고 한칸 어떠세요?</h4>
                        <p className="text-[11px] text-gray-500">최고의 노출 효과로 매출을 UP 시켜보세요!</p>
                      </div>
                      <button
                        onClick={() => setCurrentPage('payment')}
                        className="px-4 py-2 bg-pink-600 text-white rounded-xl text-xs font-bold hover:bg-pink-700 transition flex items-center gap-1"
                      >
                        <PlusCircle size={14} />
                        광고등록
                      </button>
                    </div>

                  </div>
                  {/* 중앙 콘텐츠 영역 끝 */}
                </div>
                {/* 3열 레이아웃 끝 */}
              </div>
            )}

            {/* 회원가입 페이지 (Multi-step Wizard) */}
            {
              currentPage === 'signup' && (
                <div className="max-w-3xl mx-auto px-4 py-8">
                  {/* Step Indicator */}
                  <div className="flex justify-between items-center mb-10 border-b pb-4">
                    <div className={`flex items-center gap-2 ${signupStep >= 1 ? 'font-bold' : 'text-gray-300'}`} style={{ color: signupStep >= 1 ? brand.primaryColor : undefined }}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${signupStep >= 1 ? 'text-white' : 'bg-gray-100'}`} style={{ backgroundColor: signupStep >= 1 ? brand.primaryColor : undefined }}>1</div>
                      <span className="whitespace-nowrap text-sm sm:text-base">약관동의</span>
                    </div>
                    <div className="h-px bg-gray-200 flex-1 mx-2 sm:mx-4"></div>
                    <div className={`flex items-center gap-2 ${signupStep >= 2 ? 'font-bold' : 'text-gray-300'}`} style={{ color: signupStep >= 2 ? brand.primaryColor : undefined }}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${signupStep >= 2 ? 'text-white' : 'bg-gray-100'}`} style={{ backgroundColor: signupStep >= 2 ? brand.primaryColor : undefined }}>2</div>
                      <span className="whitespace-nowrap text-sm sm:text-base">정보입력</span>
                    </div>
                    <div className="h-px bg-gray-200 flex-1 mx-2 sm:mx-4"></div>
                    <div className={`flex items-center gap-2 ${signupStep >= 3 ? 'font-bold' : 'text-gray-300'}`} style={{ color: signupStep >= 3 ? brand.primaryColor : undefined }}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${signupStep >= 3 ? 'text-white' : 'bg-gray-100'}`} style={{ backgroundColor: signupStep >= 3 ? brand.primaryColor : undefined }}>3</div>
                      <span className="whitespace-nowrap text-sm sm:text-base">가입완료</span>
                    </div>
                  </div>

                  {/* Step 1: 약관동의 */}
                  {signupStep === 1 && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-bold mb-2">이용약관 (필수)</h3>
                        <div className="h-40 overflow-y-auto border p-4 text-xs text-gray-500 bg-gray-50 rounded-lg section-terms leading-relaxed">
                          <p className="font-bold mb-1">제 1 조 (목적)</p>
                          <p className="mb-2">본 약관은 {brand.displayName}(이하 "회사"라 한다)가 제공하는 구인구직 관련 제반 서비스(이하 "서비스"라 함)의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>

                          <p className="font-bold mb-1">제 2 조 (용어의 정의)</p>
                          <p className="mb-2">1. "회원"이라 함은 ＂회사＂의 ＂서비스＂에 접속하여 이 약관에 따라 ＂회사＂와 이용계약을 체결하고 ＂회사＂가 제공하는 ＂서비스＂를 이용하는 고객을 말합니다.<br />
                            2. "아이디(ID)"라 함은 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자와 숫자의 조합을 말합니다.<br />
                            3. "비밀번호"라 함은 회원이 부여 받은 "아이디"와 일치되는 회원임을 확인하고 비밀보호를 위해 회원 자신이 정한 문자 또는 숫자의 조합을 말합니다.</p>

                          <p className="font-bold mb-1">제 3 조 (약관의 게시와 개정)</p>
                          <p className="mb-2">1. "회사"는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.<br />
                            2. "회사"는 "약관의 규제에 관한 법률", "정보통신망 이용촉진 및 정보보호 등에 관한 법률" 등 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</p>

                          <p className="font-bold mb-1">제 4 조 (이용계약 체결)</p>
                          <p>1. 이용계약은 회원이 되고자 하는 자(이하 "가입신청자")가 약관의 내용에 대하여 동의를 한 다음 회원가입신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.<br />
                            2. 회사는 가입신청자의 신청에 대하여 서비스 이용을 승낙함을 원칙으로 합니다. 다만, 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.</p>
                        </div>
                        <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                          <input type="checkbox" checked={agreements.terms} onChange={(e) => setAgreements({ ...agreements, terms: e.target.checked })} className="w-4 h-4 accent-pink-500" />
                          <span className="text-sm font-medium">회원 이용약관에 동의합니다.</span>
                        </label>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold mb-2">개인정보 보호정책 (필수)</h3>
                        <div className="h-40 overflow-y-auto border p-4 text-xs text-gray-500 bg-gray-50 rounded-lg section-privacy leading-relaxed">
                          <p className="font-bold mb-1">1. 개인정보의 수집 및 이용 목적</p>
                          <p className="mb-2">회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.<br />
                            - 회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별/인증, 회원자격 유지/관리, 서비스 부정이용 방지</p>

                          <p className="font-bold mb-1">2. 수집하는 개인정보의 항목</p>
                          <p className="mb-2">- 필수항목: 아이디, 비밀번호, 이름, 휴대전화번호<br />
                            - 선택항목: 이메일, 생년월일, 성별</p>

                          <p className="font-bold mb-1">3. 개인정보의 보유 및 이용기간</p>
                          <p className="mb-2">회사는 법령에 따른 개인정보 보유, 이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유, 이용기간 내에서 개인정보를 처리, 보유합니다.<br />
                            - 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사, 조사 등이 진행 중인 경우에는 해당 수사, 조사 종료 시까지)</p>

                          <p className="font-bold mb-1">4. 동의 거부 권리 및 불이익</p>
                          <p>정보주체는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 다만, 필수항목에 대한 동의를 거부할 경우 회원가입 및 서비스 이용이 제한될 수 있습니다.</p>
                        </div>
                        <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                          <input type="checkbox" checked={agreements.privacy} onChange={(e) => setAgreements({ ...agreements, privacy: e.target.checked })} className="w-4 h-4 accent-pink-500" />
                          <span className="text-sm font-medium">개인정보 보호정책에 동의합니다.</span>
                        </label>
                      </div>

                      <div className="flex justify-center gap-4 pt-4">
                        <button onClick={() => setCurrentPage('login')} className="px-8 py-3 rounded-xl border border-gray-300 text-gray-500 font-bold hover:bg-gray-50">취소</button>
                        <button
                          onClick={() => {
                            if (!agreements.terms || !agreements.privacy) return alert('모든 약관에 동의해야 합니다.');
                            setSignupStep(2);
                          }}
                          style={{ backgroundColor: (agreements.terms && agreements.privacy) ? brand.primaryColor : '#ccc' }}
                          className="px-12 py-3 rounded-xl text-white font-bold transition-colors"
                          disabled={!agreements.terms || !agreements.privacy}
                        >
                          다음 단계
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: 정보입력 */}
                  {signupStep === 2 && (
                    <div>
                      {/* Type Selection Tabs */}
                      <div className="flex mb-8">
                        <button
                          onClick={() => setSignupType('individual')}
                          style={{
                            borderColor: signupType === 'individual' ? brand.primaryColor : undefined,
                            color: signupType === 'individual' ? brand.primaryColor : undefined,
                            backgroundColor: signupType === 'individual' ? `${brand.primaryColor}10` : undefined
                          }}
                          className={`flex-1 py-4 font-bold text-center border-b-2 transition-colors whitespace-nowrap ${signupType === 'individual' ? 'border-pink-500 text-pink-500 bg-pink-50/50' : 'border-gray-200 text-gray-400'}`}
                        >
                          <User className="inline-block mr-2 mb-1" size={18} />
                          개인회원 (구직)
                          <p className="text-[10px] font-normal mt-1 break-keep">이력서 등록 및 입사지원</p>
                        </button>
                        <button
                          onClick={() => setSignupType('corporate')}
                          style={{
                            borderColor: signupType === 'corporate' ? brand.primaryColor : undefined,
                            color: signupType === 'corporate' ? brand.primaryColor : undefined,
                            backgroundColor: signupType === 'corporate' ? `${brand.primaryColor}10` : undefined // 10% opacity hex approximation
                          }}
                          className={`flex-1 py-4 font-bold text-center border-b-2 transition-colors whitespace-nowrap ${signupType === 'corporate' ? 'border-blue-500 text-blue-500 bg-blue-50/50' : 'border-gray-200 text-gray-400'}`}
                        >
                          <Briefcase className="inline-block mr-2 mb-1" size={18} />
                          업소회원 (구인)
                          <p className="text-[10px] font-normal mt-1 break-keep">채용공고 등록 및 인재열람</p>
                        </button>
                      </div>

                      <div className="space-y-6 max-w-lg mx-auto">
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs text-yellow-800 flex items-center gap-2 mb-4">
                          <AlertCircle size={14} />
                          <span>체크된 필수항목만 작성하시면 회원가입 가능합니다.</span>
                        </div>

                        <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center">
                          <label className="text-left sm:text-right text-sm font-bold text-gray-600 w-full sm:w-auto">아이디 <span className="text-red-500">*</span></label>
                          <div className="col-span-3 w-full">
                            <input type="text" placeholder="4~15자 영문/숫자" className="w-full p-3 border rounded-lg text-sm" />
                          </div>
                        </div>

                        <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center">
                          <label className="text-left sm:text-right text-sm font-bold text-gray-600 w-full sm:w-auto">비밀번호 <span className="text-red-500">*</span></label>
                          <div className="col-span-3 w-full">
                            <input type="password" placeholder="4~12자 이상" className="w-full p-3 border rounded-lg text-sm" />
                          </div>
                        </div>

                        <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center">
                          <label className="text-left sm:text-right text-sm font-bold text-gray-600 w-full sm:w-auto">비번확인 <span className="text-red-500">*</span></label>
                          <div className="col-span-3 w-full">
                            <input type="password" placeholder="비밀번호 재입력" className="w-full p-3 border rounded-lg text-sm" />
                          </div>
                        </div>

                        {signupType === 'corporate' && (
                          <>
                            <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center">
                              <label className="text-left sm:text-right text-sm font-bold text-gray-600 w-full sm:w-auto">업소명 <span className="text-red-500">*</span></label>
                              <div className="col-span-3 w-full">
                                <input type="text" placeholder="사업자등록증 상 상호명" className="w-full p-3 border rounded-lg text-sm" />
                              </div>
                            </div>

                            <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center">
                              <label className="text-left sm:text-right text-sm font-bold text-gray-600 w-full sm:w-auto">사업자번호 <span className="text-red-500">*</span></label>
                              <div className="col-span-3 w-full">
                                <input
                                  type="text"
                                  placeholder="000-00-00000"
                                  value={businessLicenseNumber}
                                  onChange={(e) => setBusinessLicenseNumber(e.target.value)}
                                  className="w-full p-3 border rounded-lg text-sm"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center">
                              <label className="text-left sm:text-right text-sm font-bold text-gray-600 w-full sm:w-auto">증빙서류 <span className="text-red-500">*</span></label>
                              <div className="col-span-3 w-full">
                                <div className="flex gap-2 items-center">
                                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed cursor-pointer hover:bg-gray-50 transition min-w-0 ${businessLicense ? 'border-brand-primary bg-blue-50/10' : 'border-gray-300'}`} style={{ borderColor: businessLicense ? brand.primaryColor : undefined }}>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*,.pdf"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          setBusinessLicense(e.target.files[0]);
                                        }
                                      }}
                                    />
                                    {businessLicense ? (
                                      <span className="text-xs font-bold truncate flex items-center gap-1" style={{ color: brand.primaryColor }}>
                                        <CheckCircle2 size={14} /> {businessLicense.name}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <PlusSquare size={14} /> 사업자등록증 첨부 (필수)
                                      </span>
                                    )}
                                  </label>
                                  <span className="text-[10px] text-gray-400 break-keep shrink-0">
                                    * 관리자 승인 후 가입이 완료됩니다.
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center">
                          <label className="text-left sm:text-right text-sm font-bold text-gray-600 w-full sm:w-auto">이름 <span className="text-red-500">*</span></label>
                          <div className="col-span-3 flex gap-2 w-full">
                            <input type="text" placeholder="실명 입력 (본인인증)" className="flex-1 p-3 border rounded-lg text-sm min-w-0" />
                            <button className="bg-gray-200 text-gray-600 px-3 py-2 rounded text-xs font-bold whitespace-nowrap shrink-0 hover:bg-gray-300 transition">본인인증 하기</button>
                          </div>
                        </div>

                        <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center">
                          <label className="text-left sm:text-right text-sm font-bold text-gray-600 w-full sm:w-auto">휴대폰 <span className="text-red-500">*</span></label>
                          <div className="col-span-3 w-full">
                            <input type="tel" placeholder="휴대폰 번호 (- 제외)" className="w-full p-3 border rounded-lg text-sm" />
                          </div>
                        </div>

                        <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center">
                          <label className="text-left sm:text-right text-sm font-bold text-gray-600 w-full sm:w-auto">이메일</label>
                          <div className="col-span-3 w-full">
                            <input type="email" placeholder="example@email.com" className="w-full p-3 border rounded-lg text-sm" />
                          </div>
                        </div>

                        <div className="flex flex-col sm:grid sm:grid-cols-4 gap-1 sm:gap-4 items-start">
                          <label className="text-left sm:text-right text-sm font-bold text-gray-600 w-full sm:w-auto sm:pt-2">수신동의</label>
                          <div className="col-span-3 pt-0 sm:pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" className="w-4 h-4" defaultChecked />
                              <span className="text-xs sm:text-sm text-gray-600 break-keep">SMS 수신 동의 (채용/지원 알림을 받을 수 있습니다)</span>
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-center gap-4 pt-8">
                          <button onClick={() => setSignupStep(1)} className="px-8 py-4 rounded-xl border border-gray-300 text-gray-500 font-bold hover:bg-gray-50">이전단계</button>
                          <button
                            onClick={() => {
                              if (signupType === 'corporate') {
                                if (!businessLicenseNumber) {
                                  return alert('사업자등록번호를 입력해주세요.');
                                }
                                if (REGISTERED_BUSINESS_NUMBERS.includes(businessLicenseNumber)) {
                                  return alert('이미 등록된 사업자번호입니다.\n고객센터로 문의해주시기 바랍니다.');
                                }
                                if (!businessLicense) {
                                  return alert('사업자등록증을 첨부해주세요.');
                                }
                              }
                              setSignupStep(3);
                            }}
                            style={primaryBgStyle}
                            className="px-12 py-4 rounded-xl text-white font-bold shadow-lg hover:opacity-90 transition-all"
                          >
                            가입완료
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: 가입완료 */}
                  {signupStep === 3 && (
                    <div className="text-center py-20">
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={48} className="text-green-600" />
                      </div>
                      <h2 className="text-3xl font-black mb-4">회원가입 완료!</h2>
                      <p className="text-gray-500 mb-8">
                        {brand.displayName}의 회원이 되신 것을 환영합니다.<br />
                        {signupType === 'corporate'
                          ? <span className="block mt-1 sm:inline">관리자 승인 후 서비스 이용이 가능합니다.<br className="block sm:hidden" />(최대 24시간 소요)</span>
                          : '이제부터 다양한 서비스를 이용하실 수 있습니다.'}
                      </p>
                      <button
                        onClick={() => {
                          setSignupStep(1);
                          setCurrentPage('login');
                        }}
                        style={primaryBgStyle}
                        className="px-12 py-4 rounded-xl text-white font-bold shadow-lg hover:opacity-90 transition-all"
                      >
                        로그인 하러가기
                      </button>
                    </div>
                  )}
                </>
              )}
                    </div></div></div></div>) }      </main>

        {/* Footer */}
        <footer className={`py-12 border-t font-sans ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-gray-100 text-gray-500'}`}>
          <div className="max-w-[1020px] mx-auto px-4 text-center">
            {/* Logo */}
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tighter inline-block" style={primaryStyle}>
                {brand.displayName}
              </h2>
            </div>

            {/* Links */}
            <div className="flex justify-center flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm font-bold text-gray-400 mb-8">
              <span onClick={() => setCurrentPage('home')} className={`cursor-pointer transition-colors whitespace-nowrap ${brand.theme === 'dark' ? 'hover:text-white text-gray-400' : 'hover:text-gray-900 text-gray-600'}`}>이용약관</span>
              <span onClick={() => setCurrentPage('home')} className={`cursor-pointer transition-colors font-bold whitespace-nowrap ${brand.theme === 'dark' ? 'hover:text-white text-gray-400' : 'hover:text-gray-900 text-gray-600'}`}>개인정보처리방침</span>
              <span onClick={() => setCurrentPage('home')} className={`cursor-pointer transition-colors whitespace-nowrap ${brand.theme === 'dark' ? 'hover:text-white text-gray-400' : 'hover:text-gray-900 text-gray-600'}`}>청소년보호정책</span>
              <span onClick={() => router.push('/customer-center')} className={`cursor-pointer transition-colors whitespace-nowrap ${brand.theme === 'dark' ? 'hover:text-white text-gray-400' : 'hover:text-gray-900 text-gray-600'}`}>광고/제휴문의</span>
            </div>

            {/* Info */}
            <div className="text-[11px] sm:text-xs text-gray-400 leading-relaxed opacity-80 mb-8">
              <p>
                <span className={`font-bold ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>{brand.displayName}</span> |
                대표: 김코코 |
                사업자등록번호: 226-13-91078
              </p>
              <p className="mt-1">
                주소: 서울특별시 강남구 테헤란로 123, 4층
                <span className="hidden sm:inline"> | </span>
                <br className="block sm:hidden" />
                <span className="whitespace-nowrap">직업정보제공사업 신고번호: 2024-서울강남-1234</span>
              </p>
              <p className="mt-1">
                고객센터: 1544-0000 (평일 09:00 ~ 18:00)
                <span className="hidden sm:inline"> | </span>
                <br className="block sm:hidden" />
                <span className="whitespace-nowrap">이메일: bizsetter7@gmail.com</span>
              </p>
            </div>

            {/* Copyright */}
            <div className={`text-[10px] pt-8 break-keep border-t ${brand.theme === 'dark' ? 'text-gray-600 border-gray-800' : 'text-gray-300 border-gray-100'}`}>
              <p className="mb-1">© {new Date().getFullYear()} {brand.name} UNIVERSE. All Rights Reserved.</p>
              <p>본 사이트는 구인구직 정보의 중개 시스템으로, 정보의 정확성에 대한 책임은 등록자에게 있습니다.</p>
            </div>
          </div>
        </footer >

        {/* Mobile Nav */}
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 w-full border-t flex justify-around py-3 z-40 text-[10px] text-gray-400 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <button onClick={() => setCurrentPage('home')} className="flex flex-col items-center gap-1 hover:text-brand-primary active:text-brand-primary transition-colors">
            <Home size={20} /> 홈
          </button>
          <button onClick={() => router.push('/community')} className="flex flex-col items-center gap-1 hover:text-brand-primary transition-colors">
            <MessageCircle size={20} /> 커뮤니티
          </button>
          <button onClick={() => setCurrentPage('payment')} className="flex flex-col items-center gap-1 font-bold group" style={{ color: brand.primaryColor }}>
            <PlusCircle size={36} className="-mt-6 bg-white rounded-full shadow-lg border-4 border-white group-active:scale-95 transition-transform" />
            <span className="mt-1">광고등록</span>
          </button>
          <Link href="/lounge" className="flex flex-col items-center gap-1 hover:text-brand-primary transition-colors">
            <Sparkles size={20} /> 라운지
          </Link>
          <button onClick={() => setCurrentPage('login')} className="flex flex-col items-center gap-1 hover:text-brand-primary transition-colors">
            <User size={20} /> MY
          </button>
        </nav >
    </div >
  );
}
