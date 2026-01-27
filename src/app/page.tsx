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
  const [visibleCount, setVisibleCount] = useState(10);

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
  const userLocation = useLocation();

  // 지역 기반 필터링 및 정렬 로직 (국내 최초 핵심 엔진)
  const filteredShops = useMemo(() => {
    let list = [...shops];

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
                      if (item.label === '지역별채용') {
                        document.getElementById('region-section')?.scrollIntoView({ behavior: 'smooth' });
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
                    className={`group relative border-[3px] rounded-[22px] overflow-hidden shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl cursor-pointer aspect-square ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-white'}
                      ${shop.tier === 'grand' ? `!border-amber-400 ring-4 ring-amber-400/20` : shop.tier === 'preferential' ? `!border-gray-300` : ''}
                    `}
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


              {/* 지역별 구인 공고 (검색창 + 전략 광고) */}
              <div className="mt-8 mb-14">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className={`flex items-center gap-2 text-xl font-black ${brand.theme === 'dark' ? 'text-black' : 'text-black'}`}>
                    <span className="text-2xl text-black">|</span>
                    <span>지역을 선택해주세요</span>
                  </h3>
                </div>

                {/* 🚀 [Region Prime AD] 지역 섹션 전용 전략 광고 지면 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                  <div
                    onClick={() => router.push('/customer-center?tab=ad')}
                    className={`md:col-span-1 border rounded-2xl p-4 flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-md transition-all group ${brand.theme === 'dark' ? 'bg-amber-900/10 border-amber-900/30' : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100'}`}
                  >
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full mb-2 uppercase tracking-widest ${brand.theme === 'dark' ? 'text-amber-500 bg-amber-900/30' : 'text-amber-600 bg-amber-100'}`}>Grand Region AD</span>
                    <h4 className={`text-sm font-black mb-1 group-hover:text-amber-600 ${brand.theme === 'dark' ? 'text-gray-900' : 'text-gray-900'}`}>이 지역 1등 프리미엄 💎</h4>
                    <p className={`text-[10px] font-bold italic ${brand.theme === 'dark' ? 'text-gray-600' : 'text-gray-600'}`}>지금 바로 입점하고 상단 노출!</p>
                  </div>
                  <div
                    onClick={() => router.push('/customer-center?tab=ad')}
                    className={`md:col-span-2 border rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-pink-500 ${brand.theme === 'dark' ? 'bg-pink-900/10' : 'bg-pink-50'}`}>
                        <Crown size={24} />
                      </div>
                      <div>
                        <h4 className={`text-sm font-black ${brand.theme === 'dark' ? 'text-gray-900' : 'text-black'}`}>준비된 인재들이 기다립니다! 👑</h4>
                        <p className={`text-[10px] font-bold ${brand.theme === 'dark' ? 'text-gray-600' : 'text-gray-600'}`}>지역별 맞춤 구인으로 정규직 채용 완료</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 bg-pink-600 text-white text-[11px] font-black rounded-xl shadow-lg ${brand.theme === 'dark' ? 'shadow-none' : 'shadow-pink-200'}`}>광고신청</div>
                  </div>
                </div>

                {/* 2단계 필터 + 검색 버튼 유닛 */}
                <div className={`flex flex-wrap items-center gap-2 sm:gap-3 p-4 rounded-[28px] border ${brand.theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-100/50 border-gray-200/50'}`}>
                  <div className="flex gap-2 flex-1 min-w-[200px]">
                    {/* 1단계: 지역 선택 */}
                    <div className="relative group flex-1">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-500 transition-colors">
                        <Home size={14} />
                      </div>
                      <select
                        className={`w-full text-[12px] font-black pl-9 pr-10 py-3 rounded-2xl border-2 appearance-none transition-all cursor-pointer ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-pink-500' : 'bg-white border-gray-100 text-black shadow-sm hover:border-gray-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-50'}`}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d1d5db' stroke-width='3' %3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em' }}
                        value={selectedRegion}
                        onChange={(e) => {
                          setSelectedRegion(e.target.value);
                          setSelectedSubRegion('전체');
                          setVisibleCount(10);
                        }}
                      >
                        <option value="전체">지역전체</option>
                        {Object.keys(REGIONS_MAP).map(reg => (
                          <option key={reg} value={reg}>{reg}</option>
                        ))}
                      </select>
                    </div>

                    {/* 2단계: 상세 지역 선택 */}
                    <div className="relative group flex-1">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <ShoppingBag size={14} />
                      </div>
                      <select
                        disabled={selectedRegion === '전체'}
                        className={`w-full text-[12px] font-black pl-9 pr-10 py-3 rounded-2xl border-2 appearance-none transition-all cursor-pointer disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-white border-gray-100 text-black shadow-sm hover:border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'}`}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d1d5db' stroke-width='3' %3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em' }}
                        value={selectedSubRegion}
                        onChange={(e) => {
                          setSelectedSubRegion(e.target.value);
                          setVisibleCount(10);
                        }}
                      >
                        <option value="전체">상세전체</option>
                        {selectedRegion !== '전체' && (REGIONS_MAP[selectedRegion] as string[])?.map((sub: string) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 🚀 검색 버튼 (사용자 요청 사항) */}
                  <button
                    onClick={() => {
                      document.getElementById('job-list-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`bg-pink-600 text-white px-6 py-3 rounded-2xl font-black text-[13px] shadow-lg hover:bg-pink-700 active:scale-95 transition-all flex items-center gap-2 group whitespace-nowrap ${brand.theme === 'dark' ? 'shadow-none' : 'shadow-pink-200'}`}
                  >
                    <Search size={16} className="group-hover:animate-pulse" />
                    지역 검색하기
                  </button>
                </div>
              </div>

              {/* [QUEEN STYLE] 4번 스페셜 채용정보 */}
              <div className="mb-14">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`flex items-center gap-2 text-xl font-black ${brand.theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>
                    <span className="text-2xl">|</span>
                    <span>스페셜채용정보</span>
                  </h3>
                  <button
                    onClick={() => router.push('/customer-center?tab=ad')}
                    className={`text-[10px] md:text-[11px] font-black border px-3 py-1.5 rounded-md shadow-sm hover:shadow-md transition-all flex items-center gap-1 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
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
                    className={`text-[9px] font-black border px-2 py-1 rounded-sm shadow-sm flex items-center gap-1 active:scale-95 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-black'}`}
                  >
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
              <div id="job-list-section" className="mt-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <h3 className={`flex items-center gap-2 text-xl font-black ${brand.theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>
                      <span className="text-2xl">|</span>
                      <span>최신채용정보 (줄광고)</span>
                    </h3>
                    {userLocation.isDetected && (
                      <span className="text-[10px] text-pink-500 font-bold bg-pink-50 px-2 py-1 rounded-lg">📍 {userLocation.region} 인근 추천</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {filteredShops.slice(0, visibleCount).map((shop, i) => {
                    const isNativeAdPos = (i + 1) % 3 === 0;

                    return (
                      <React.Fragment key={i}>
                        <div
                          onClick={() => setSelectedShop(shop)}
                          className={`group relative flex items-center p-4 rounded-2xl border-b transition-all hover:bg-gray-50 cursor-pointer ${brand.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
                        >
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 mr-4 ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-500' : 'bg-pink-50 text-pink-500 animate-pulse-subtle'}`}>
                            {shop.name.substring(0, 1)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 text-[10px] sm:text-xs">
                              <span className="text-blue-600 font-black">{shop.region.split(' ').slice(0, 2).join(' ')}</span>
                              <span className="text-gray-300">|</span>
                              <span className="text-gray-500 font-bold">{shop.workType}</span>
                            </div>
                            <h4 className={`text-base font-black truncate mb-1 ${brand.theme === 'dark' ? 'text-white' : 'text-black'}`}>{shop.name}</h4>
                            <div className="flex items-center gap-3">
                              <p className="text-sm font-black text-red-600 tracking-tighter">{shop.pay}</p>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${brand.theme === 'dark' ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>방금 전</span>
                            </div>
                          </div>
                          <div className="shrink-0 ml-3">
                            <ChevronRight size={20} className="text-gray-300 group-hover:text-pink-500 transition-colors" />
                          </div>
                        </div>

                        {/* 리스트 네이티브 광고 (간소화) */}
                        {((i + 1) % 5 === 0) && (
                          <div className={`col-span-1 border rounded-[22px] px-5 py-3 flex items-center justify-between group cursor-pointer hover:border-rose-400 transition-all ${brand.theme === 'dark' ? 'bg-rose-900/10 border-rose-900/30' : 'bg-rose-50 border-rose-100'}`}>
                            <div className="flex items-center gap-3">
                              <Star size={18} className="text-rose-500" fill="currentColor" />
                              <h5 className={`text-xs font-black ${brand.theme === 'dark' ? 'text-gray-100' : 'text-black'}`}>사장님, 광고 한 칸 어떠세요?</h5>
                            </div>
                            <button className={`text-[10px] font-black px-3 py-1.5 rounded-full bg-white text-rose-500 shadow-sm border border-rose-100`}>문의</button>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {visibleCount < filteredShops.length && (
                  <button
                    onClick={() => setVisibleCount(prev => prev + 20)}
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
                      <span className="text-xs font-normal text-gray-400 ml-2">언니들이 사장님을 기다리고 있어요!</span>
                    </h3>
                    <Link href="/lounge" className="text-xs text-blue-500 font-bold hover:underline">인재 전체보기</Link>
                  </div>

                  <div className={`rounded-3xl border shadow-xl overflow-hidden ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] sm:text-sm">
                        <thead className={`border-b ${brand.theme === 'dark' ? 'bg-gray-900/80 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
                          <tr>
                            <th className="px-3 sm:px-6 py-4 font-black text-gray-500">이름/나이</th>
                            <th className="px-3 sm:px-6 py-4 font-black text-gray-500">희망지역</th>
                            <th className="px-3 sm:px-6 py-4 font-black text-gray-500 hidden md:table-cell">자기소개</th>
                            <th className="px-3 sm:px-6 py-4 font-black text-gray-500 text-right">등록일</th>
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
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                <span className={`font-black group-hover:text-rose-600 ${brand.theme === 'dark' ? 'text-gray-100' : 'text-black'}`}>{person.name}</span>
                                <span className="text-gray-500 ml-1.5 font-bold">({person.age})</span>
                              </td>
                              <td className={`px-3 sm:px-6 py-4 font-black whitespace-nowrap ${brand.theme === 'dark' ? 'text-gray-400' : 'text-gray-900'}`}>{person.region}</td>
                              <td className="px-3 sm:px-6 py-4 text-gray-500 hidden md:table-cell truncate max-w-xs">{person.desc}</td>
                              <td className="px-3 sm:px-6 py-4 text-right text-gray-400 font-extrabold whitespace-nowrap">{person.date}</td>
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
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedShop(null)}>
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

        {currentPage === 'payment' && (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className={`p-6 md:p-8 rounded-2xl shadow-lg border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} style={{ borderColor: brand.primaryColor }}>
              <h2 className="text-2xl font-bold mb-2 text-center">사장님 전용 상품 안내</h2>
              <div className="bg-red-50 text-red-600 text-center text-sm p-2 rounded mb-6 font-bold">
                🎉 오픈 기념 선착순 100업소 3개월 무료 체험 진행 중!
              </div>

              <div className="space-y-4 mb-8">
                <label className="block p-4 border-2 border-red-500 bg-red-50/50 rounded-xl cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-3 py-1 font-bold">EVENT</div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block font-bold text-lg">기본 광고 (3개월)</span>
                      <span className="text-sm text-gray-500">배너 노출 + 인재 열람권 포함</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-gray-400 line-through text-xs">300,000원</span>
                      <span className="text-2xl font-black text-red-500">0원</span>
                    </div>
                  </div>
                </label>
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
        )}

        {currentPage === 'community' && (
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
              <div className={`p-4 rounded-lg shadow-sm border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-100 text-gray-700'}`}>
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
        )}


        {/* 로그인 페이지 */}
        {currentPage === 'login' && (
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
                    className="w-full py-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition shadow-sm"
                    onClick={() => alert('구글 로그인 연동 준비 중입니다.')}
                  >
                    <span className="font-black text-lg text-blue-500">G</span> 구글로 시작하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 회원가입 페이지 (Multi-step Wizard) */}
        {currentPage === 'signup' && (
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
          </div>
        )}
      </main>

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
      </footer>

      {/* Mobile Nav */}
      <nav className={`md:hidden fixed bottom-0 w-full border-t flex justify-around py-3 z-40 text-[10px] text-gray-400 ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
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
      </nav>
    </div>
  );
}
