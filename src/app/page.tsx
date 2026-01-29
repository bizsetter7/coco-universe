'use client';

import { useBrand } from '@/components/BrandProvider';
import { useLocation } from '@/hooks/useLocation';
import { REGIONS_MAP } from '../constants/regions';
import { Crown, Flame, Home, MessageCircle, MessageSquare, Pencil, PlusCircle, ShoppingBag, User, Siren, AlertTriangle, Lock, ThumbsUp, Apple, Sparkles, Moon, ArrowRight, CheckCircle2, ShieldCheck, X, Phone, AlertCircle, Briefcase, Scale, Gift, Trophy, PlusSquare, FileText, Megaphone, Users, ChevronLeft, ChevronRight, MapPin, Star, Zap, Search } from 'lucide-react';
import Link from 'next/link';
import { MOCK_POSTS } from '@/constants/community';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import EventPopup from '@/components/EventPopup';
import RightSidebar from '@/components/RightSidebar';
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
  tier?: 'grand' | 'preferential' | 'premium' | 'special' | 'urgent' | 'recommended' | 'common' | 'basic';
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

const JOB_TYPES = ['룸', '퍼블릭', '가라오케', '바(Bar)', '카페/서빙', '카운터/데스크', '기타'];

export default function HomePortal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brand = useBrand();
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [currentPage, _setCurrentPage] = useState('home');

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
    } else if (page === 'login') {
      _setCurrentPage('login');
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
  const [selectedJobType, setSelectedJobType] = useState('전체');
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
      // 이미 tier가 정의되어 있다면 유지하되, basic은 common으로 변환
      let tier = shop.tier || 'common';
      if (tier === 'basic') tier = 'common';

      // 섹션이 비어 보이는 것을 방지하기 위해 데이터 인덱스 기반으로 강제 분배 (샘플링)
      if (tier === 'common') {
        if (index % 100 === 10) tier = 'special';
        else if (index % 100 === 20) tier = 'urgent';
        else if (index % 100 === 30) tier = 'recommended';
      }

      // grand 중 일부를 2번(preferential)으로 배분
      if (tier === 'grand' && index % 3 === 1) tier = 'preferential';

      return { ...shop, tier };
    });
  }, []);

  const [shops] = useState<Shop[]>(processedShopsWithTiers);
  const [regions] = useState<string[]>(regionsData as string[]);
  const [showAllGrand, setShowAllGrand] = useState(false);
  const [showAllSpecial, setShowAllSpecial] = useState(false);
  const [showAllUrgent, setShowAllUrgent] = useState(false);
  const userLocation = useLocation();

  // 지역 기반 필터링 및 정렬 로직 (국내 최초 핵심 엔진)
  const filteredShops = useMemo(() => {
    let list = [...shops];

    // 1. 지역 필터링 (URL 파라미터 우선)
    const paramRegion = searchParams.get('region');
    const targetRegion = (paramRegion && paramRegion !== '전체') ? paramRegion : selectedRegion;

    if (targetRegion !== '전체') {
      list = list.filter(shop => shop.region.includes(targetRegion));
      // 서브 지역은 URL 파라미터가 없을 때만 state 사용 (복잡도 감소)
      if (!paramRegion && selectedSubRegion !== '전체') {
        list = list.filter(shop => shop.region.includes(selectedSubRegion));
      }
    }

    // 2. 업직종 필터링 (URL 파라미터)
    const paramJob = searchParams.get('job');
    if (paramJob) {
      // workType이나 name 등에 포함되어 있는지 확인 (범용 검색)
      list = list.filter(shop =>
        (shop.workType && shop.workType.includes(paramJob)) ||
        (shop.name && shop.name.includes(paramJob))
      );
    }

    // 3. 고용형태 필터링 (URL 파라미터)
    const paramWorkType = searchParams.get('workType');
    if (paramWorkType) {
      list = list.filter(shop => shop.workType && shop.workType.includes(paramWorkType));
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
    <div className={`min-h-screen relative pb-20`}>
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
      <main>
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
                  { label: '지역별채용', icon: <Home />, bg: 'bg-blue-100', color: 'text-blue-600', link: 'home' },
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
                      if (item.label === '업종별채용') {
                        router.push('/?region=전체&view=job');
                        setCurrentPage('region');
                        window.scrollTo(0, 0);
                      } else if (item.label === '지역별채용') {
                        setCurrentPage('region');
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

              {/* 광고 영역 (1번 그랜드 / 2번 우대) */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <Crown size={20} className="text-amber-500" fill="currentColor" />
                  <span>1번 그랜드 프리미엄</span>
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
                {shops.filter(s => s.tier === 'grand' || s.tier === 'preferential').slice(0, 8).map((shop, i) => (
                  <div
                    key={shop.id || i}
                    onClick={() => setSelectedShop(shop)}
                    className={`group relative border rounded-[22px] overflow-hidden shadow-sm transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer aspect-square ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}
                  >
                    <div className={`w-full h-full flex items-center justify-center text-gray-500 text-[10px] font-black break-keep text-center px-4 relative ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      {shop.name.split(' ').slice(0, 2).join(' ')}<br />매장 이미지
                      {shop.options?.blink && (
                        <div className="absolute top-2 left-2 bg-rose-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black animate-bounce shadow-sm">급구</div>
                      )}

                      {/* 카드 하단 정보 오버레이 (정사각형 유지를 위해 내부 배치) */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-left">
                        <h4 className="text-white font-black text-[13px] sm:text-[14px] truncate mb-0.5">{shop.name}</h4>
                        <div className="flex justify-between items-end">
                          <p className="text-amber-400 font-extrabold text-[11px] sm:text-[12px]">{shop.pay}</p>
                          <p className="text-gray-300 text-[9px] font-bold">{shop.region.split(' ').slice(0, 2).join(' ')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>




              {/* [QUEEN STYLE] 4번 스페셜 채용정보 */}
              <div className="mb-14">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`flex items-center gap-2 text-xl font-black ${brand.theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>
                    <span className="text-2xl">|</span>
                    <span>스페셜 채용 정보</span>
                  </h3>
                  <button
                    onClick={() => router.push('/customer-center?tab=ad')}
                    className={`text-[10px] sm:text-[11px] font-black border px-3 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all flex items-center gap-1 active:scale-95 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'}`}
                  >
                    <PlusCircle size={12} className="text-purple-500" />
                    광고신청 +
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {shops.filter(s => s.tier === 'special').slice(0, 12).map((shop, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedShop(shop)}
                      className={`group border rounded-xl p-1 shadow-sm hover:border-purple-400 transition-all cursor-pointer overflow-hidden aspect-square ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
                    >
                      <div className={`relative w-full h-full rounded-lg flex items-center justify-center text-[10px] font-black overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-600' : 'bg-gray-50 text-gray-400'}`}>
                        {shop.name.substring(0, 1)}
                        <div className="absolute top-1 right-1 bg-red-600 text-white text-[7px] px-1 py-0.5 rounded-sm font-black italic shadow-sm">HOT</div>

                        {/* 스페셜 오버레이 */}
                        <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/60 text-left">
                          <h5 className="text-white text-[10px] font-black truncate">{shop.name}</h5>
                          <p className="text-red-400 text-[9px] font-black">{shop.pay.split(' ')[1] || shop.pay}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5번 급구 및 추천채용 통합 섹션 */}
              <div className="mb-16">
                <div className="flex items-center justify-between mb-5">
                  <h3 className={`flex items-center gap-2 text-xl font-black ${brand.theme === 'dark' ? 'text-purple-400' : 'text-black'}`}>
                    <span className="text-2xl text-purple-600">|</span>
                    <span>급구 및 추천채용</span>
                  </h3>
                  <button
                    onClick={() => router.push('/customer-center?tab=ad')}
                    className={`text-[10px] sm:text-[11px] font-black border px-3 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all flex items-center gap-1 active:scale-95 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'}`}
                  >
                    <PlusCircle size={12} className="text-pink-500" />
                    광고신청 +
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {shops.filter(s => s.tier === 'urgent' || s.tier === 'recommended' || s.recommended).slice(0, 6).map((shop, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedShop(shop)}
                      className={`border rounded-2xl p-4 sm:p-5 hover:border-rose-400 transition-all cursor-pointer group flex gap-4 ${brand.theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-100 shadow-inner'}`}
                    >
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-900 border border-gray-700 text-blue-400' : 'bg-white border border-gray-100 text-blue-400'}`}>
                        {shop.name.substring(0, 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h5 className={`font-black text-[14px] truncate group-hover:text-rose-500 transition-colors ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>{shop.name}</h5>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${shop.tier === 'urgent' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                            {shop.tier === 'urgent' ? '급구' : '추천'}
                          </span>
                        </div>
                        <p className={`text-[11px] font-bold text-gray-500 mb-1`}>{shop.region.split(' ').slice(0, 2).join(' ')} | {shop.workType}</p>
                        <p className="text-xs font-black text-red-600 tracking-tight">{shop.pay}</p>
                      </div>
                    </div>
                  ))}
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
                    <p className="text-[10px] text-gray-400">{brand.name}를 통해 연락했다고 말씀해주세요!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* Region Page */}
        {currentPage === 'region' && (
          <div className="max-w-[1300px] mx-auto px-0 md:px-4 py-0 md:py-8 min-h-screen bg-gray-50 md:bg-white lg:flex lg:gap-8 items-start">
            <div className="flex-1 min-w-0 max-w-[1020px] mx-auto w-full">
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
                <button onClick={(e) => { e.stopPropagation(); setBannerIndex((prev) => (prev === 0 ? REGION_BANNERS.length - 1 : prev - 1)); }} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 backdrop-blur-md rounded-full text-white/50 hover:bg-white/20 hover:text-white transition-all border border-white/10"><ChevronLeft size={24} /></button>
                <button onClick={(e) => { e.stopPropagation(); setBannerIndex((prev) => (prev + 1) % REGION_BANNERS.length); }} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 backdrop-blur-md rounded-full text-white/50 hover:bg-white/20 hover:text-white transition-all border border-white/10"><ChevronRight size={24} /></button>
                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                  {REGION_BANNERS.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setBannerIndex(i); }}
                      className={`w-2 h-2 rounded-full transition-all ${i === bannerIndex ? 'bg-white w-5' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="px-4 py-6 md:px-0">
                <h3 className={`text-2xl md:text-3xl font-black flex items-center gap-2 mb-6 ${brand.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><span className="text-pink-600">|</span> 지역별채용</h3>

                {/* Search Section */}
                <div className={`p-3.5 md:p-6 rounded-[20px] md:rounded-[32px] border shadow-sm space-y-2 md:space-y-0 md:flex md:items-center md:gap-3 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                  {/* Mobile Selects */}
                  <div className="grid grid-cols-2 gap-1 md:hidden flex-1">
                    <select
                      className={`w-full p-2.5 rounded-lg text-xs font-bold border appearance-none transition-all cursor-pointer ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-pink-500 focus:bg-white'}`}
                      value={selectedRegion}
                      onChange={(e) => {
                        setSelectedRegion(e.target.value);
                        setSelectedSubRegion('전체');
                      }}
                    >
                      <option value="전체">지역선택</option>
                      {Object.keys(REGIONS_MAP).map(reg => (
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
                  {/* Desktop Search Section */}
                  <div className="hidden md:flex items-center gap-2 flex-1">
                    <select className={`p-3 rounded-xl font-bold text-sm border-2 appearance-none cursor-pointer ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-900 hover:border-pink-200'}`} value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); setSelectedSubRegion('전체'); }}>
                      <option value="전체">지역전체</option>
                      {Object.keys(REGIONS_MAP).map(reg => <option key={reg} value={reg}>{reg}</option>)}
                    </select>
                    <select disabled={selectedRegion === '전체'} className={`p-3 rounded-xl font-bold text-sm border-2 appearance-none cursor-pointer disabled:opacity-50 ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-900 hover:border-blue-200'}`} value={selectedSubRegion} onChange={(e) => setSelectedSubRegion(e.target.value)}>
                      <option value="전체">세부지역</option>
                      {selectedRegion !== '전체' && (REGIONS_MAP[selectedRegion] as string[])?.map((sub: string) => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                    <select className={`p-3 rounded-xl font-bold text-sm border-2 appearance-none cursor-pointer ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-900 hover:border-purple-200'}`} value={selectedJobType} onChange={(e) => setSelectedJobType(e.target.value)}>
                      <option value="전체">직종선택</option>
                      {JOB_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="키워드 검색" className={`p-3 rounded-xl font-medium text-sm border-2 transition-all flex-1 ${brand.theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-pink-500'}`} />
                    <button style={primaryBgStyle} className="p-3.5 rounded-xl text-white shadow-lg"><Search size={22} /></button>
                  </div>
                </div>
              </div>

              {/* Job List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
                {shops.filter(s => s.tier === 'urgent' || s.tier === 'recommended').slice(0, 12).map((shop, i) => (
                  <div key={i} onClick={() => setSelectedShop(shop)} className={`border rounded-2xl p-4 sm:p-5 hover:border-rose-400 transition-all cursor-pointer group flex gap-4 ${brand.theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-100 shadow-inner'}`}>
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-900 border border-gray-700 text-blue-400' : 'bg-white border border-gray-100 text-blue-400'}`}>{shop.name.substring(0, 1)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className={`font-black text-[14px] truncate group-hover:text-rose-500 transition-colors ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>{shop.name}</h5>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${shop.tier === 'urgent' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>{shop.tier === 'urgent' ? '급구' : '추천'}</span>
                      </div>
                      <p className={`text-[11px] font-bold text-gray-500 mb-1`}>{shop.region.split(' ').slice(0, 2).join(' ')} | {shop.workType}</p>
                      <p className="text-xs font-black text-red-600 tracking-tight">{shop.pay}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <RightSidebar />
          </div>
        )}

        {/* Payment Page */}
        {currentPage === 'payment' && (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className={`p-6 md:p-8 rounded-2xl shadow-lg border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} style={{ borderColor: brand.primaryColor }}>
              <h2 className="text-2xl font-bold mb-2 text-center">사장님 전용 상품 안내</h2>
              <div className="bg-red-50 text-red-600 text-center text-sm p-2 rounded mb-6 font-bold">🎉 오픈 기념 선착순 100업소 3개월 무료 체험 진행 중!</div>
              <div className="space-y-3 mb-8">
                {[
                  { id: 1, name: '1번 - 그랜드 (Grand)', price: '350,000원' },
                  { id: 2, name: '2번 - 우대 (Preferential)', price: '200,000원' },
                ].map((pkg) => (
                  <label key={pkg.id} className={`block p-4 border rounded-xl cursor-pointer transition-all hover:border-pink-500 ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex justify-between items-center"><span className="font-bold text-sm block">{pkg.name}</span><span className="font-bold text-pink-500 text-sm">{pkg.price}</span></div>
                  </label>
                ))}
              </div>
              <button style={primaryBgStyle} className="w-full py-4 rounded-xl text-white font-bold" onClick={() => alert('신청 완료!')}>상품 신청하기</button>
            </div>
          </div>
        )}

        {/* Community Page */}
        {currentPage === 'community' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Siren className="text-red-500" /> 블랙리스트 공유</h2>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border relative ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="blur-sm select-none">
                  <h3 className="font-bold mb-1">010-XXXX-5678 (문신, 30대)</h3>
                  <p className="text-sm">룸 안에서 몰래 촬영 시도함...</p>
                </div>
                <div className={`absolute inset-0 flex flex-col items-center justify-center ${brand.theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'}`}>
                  <Lock className="w-8 h-8 text-gray-400 mb-2" /><p className="font-bold text-sm">회원가입 후 확인 가능합니다</p>
                  <button className="mt-2 text-white px-4 py-1.5 rounded text-xs font-bold" style={primaryBgStyle} onClick={() => setCurrentPage('signup')}>3초 회원가입</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login & Signup Pages */}
        {currentPage === 'login' && (
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-black mb-10" style={primaryStyle}>{brand.displayName}</h2>
            <div className="space-y-4">
              <input type="text" placeholder="아이디" className="w-full p-4 rounded-xl border border-gray-200" />
              <input type="password" placeholder="비밀번호" className="w-full p-4 rounded-xl border border-gray-200" />
              <button style={primaryBgStyle} className="w-full text-white font-bold py-4 rounded-xl shadow-lg" onClick={() => alert('서비스 준비 중!')}>로그인</button>
              <button className="text-gray-400 text-sm mt-4 hover:underline" onClick={() => setCurrentPage('signup')}>회원가입</button>
            </div>
          </div>
        )}

        {currentPage === 'signup' && (
          <div className="max-w-3xl mx-auto px-4 py-16 min-h-screen text-center">
            <h2 className="text-2xl font-bold mb-10">회원가입</h2>
            <div className="space-y-4 max-w-sm mx-auto">
              <input type="text" placeholder="아이디" className="w-full p-4 rounded-xl border border-gray-200" />
              <input type="password" placeholder="비밀번호" className="w-full p-4 rounded-xl border border-gray-200" />
              <button style={primaryBgStyle} className="w-full py-4 rounded-xl text-white font-bold" onClick={() => alert('가입 완료!')}>가입하기</button>
            </div>
          </div>
        )}
      </main>

      <footer className={`py-12 border-t font-sans ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-gray-100 text-gray-500'}`}>
        <div className="max-w-[1020px] mx-auto px-4 text-center">
          <h2 className="text-2xl font-black mb-6" style={primaryStyle}>{brand.displayName}</h2>
          <div className="text-[10px] sm:text-xs opacity-80">© {new Date().getFullYear()} {brand.name} UNIVERSE. All Rights Reserved.</div>
        </div>
      </footer>

      <nav className={`md:hidden fixed bottom-0 w-full border-t flex justify-around py-3 z-40 text-[10px] text-gray-400 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <button onClick={() => setCurrentPage('home')} className="flex flex-col items-center gap-1"><Home size={20} /> 홈</button>
        <button onClick={() => setCurrentPage('community')} className="flex flex-col items-center gap-1"><MessageCircle size={20} /> 커뮤니티</button>
        <button onClick={() => setCurrentPage('payment')} className="flex flex-col items-center gap-1 font-bold" style={{ color: brand.primaryColor }}><PlusCircle size={36} className="-mt-6 bg-white rounded-full shadow-lg border-4 border-white" /><span>광고등록</span></button>
        <button onClick={() => setCurrentPage('home')} className="flex flex-col items-center gap-1"><Sparkles size={20} /> 라운지</button>
        <button onClick={() => setCurrentPage('login')} className="flex flex-col items-center gap-1"><User size={20} /> MY</button>
      </nav>
    </div>
  );
}
