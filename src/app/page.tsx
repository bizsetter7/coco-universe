'use client'; // Deploy Version: 2026-03-14

import React, { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HomeClient from '@/components/home/HomeClient';
import shopsData from '@/lib/data/shops.json';
import { Shop } from '@/types/shop';
import { LoginPage } from '@/components/auth/LoginPage';
import { SignupPage } from '@/components/auth/SignupPage';
import { CustomerCenterContent } from '@/app/customer-center/page';
import { useLocation } from '@/hooks/useLocation';
import { isPreRelease } from '@/lib/config';
import { ShieldCheck } from 'lucide-react';

// B2B Landing Component (Audit/Cloaking Mode)
const B2BLandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="text-white" size={20} />
                        </div>
                        <span className="text-lg font-black tracking-tight text-slate-900 uppercase">코코알바 B2B</span>
                    </div>
                </div>
            </nav>

            <section className="pt-32 pb-20 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                        데이터 기반 맞춤형<br /><span className="text-blue-600">인재 매칭 솔루션</span>
                    </h1>
                    <p className="text-lg text-slate-500 mb-10">
                        AI 알고리즘과 철저한 평판 검증을 통해, 기업이 당면한 인재 확보의 어려움을 가장 스마트하게 해결합니다.
                    </p>
                    <a href="#contact" className="inline-block px-8 py-4 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition">
                        서비스 도입 문의
                    </a>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 grid xl:grid-cols-4 md:grid-cols-2 gap-8">
                    <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50">
                        <h3 className="text-lg font-bold mb-3">🔎 100% 실명 검증된 인재 Pool</h3>
                        <p className="text-sm text-slate-500">NICE평가정보 및 다날 본인인증 시스템과 연동된 '실명 기반 신원 검증 로직'을 통과한 인재만을 제공합니다.</p>
                    </div>
                    <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50">
                        <h3 className="text-lg font-bold mb-3">📊 AI 정밀 핏(Fit) 및 역량 매칭</h3>
                        <p className="text-sm text-slate-500">기업의 인재상에 가장 완벽하게 부합하는 맞춤형 인재를 최단 기간 내에 추천하고 연결합니다.</p>
                    </div>
                    <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50">
                        <h3 className="text-lg font-bold mb-3">🛡️ 안심 채용 스마트 에스크로 솔루션</h3>
                        <p className="text-sm text-slate-500">투명한 임금 정산 및 분쟁 없는 채용 문화를 선도합니다.</p>
                    </div>
                    <div className="p-6 border border-slate-100 rounded-2xl bg-slate-50">
                        <h3 className="text-lg font-bold mb-3">💼 전담 B2B 채용 매니저 배정</h3>
                        <p className="text-sm text-slate-500">기업 고객 대상 1:1 전담 컨설턴트가 배정되어 성공적인 온보딩을 지원합니다.</p>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-slate-50">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl font-black text-center mb-12">4단계 원스톱 채용 프로세스</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 font-bold rounded-full flex items-center justify-center shrink-0">1</div>
                            <div>
                                <h4 className="font-bold text-lg">도입 문의 및 니즈 분석</h4>
                                <p className="text-slate-500">전문 채용 컨설턴트와의 심층 상담을 통해 기업 요구 직무 분석</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 font-bold rounded-full flex items-center justify-center shrink-0">2</div>
                            <div>
                                <h4 className="font-bold text-lg">맞춤형 솔루션 세팅</h4>
                                <p className="text-slate-500">AI 매칭 알고리즘 가중치 세팅 및 전용 파이프라인 구축</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 font-bold rounded-full flex items-center justify-center shrink-0">3</div>
                            <div>
                                <h4 className="font-bold text-lg">블라인드 데이터 매칭</h4>
                                <p className="text-slate-500">실무 역량 데이터 기반 핵심 인재 선별 추천</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-6 bg-white rounded-2xl shadow-sm">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 font-bold rounded-full flex items-center justify-center shrink-0">4</div>
                            <div>
                                <h4 className="font-bold text-lg">채용 확정 및 온보딩 케어</h4>
                                <p className="text-slate-500">성공적인 조직 적응을 위한 사후 지원 및 계약 이행 관리</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer id="contact" className="py-12 bg-slate-900 border-t border-slate-800 text-slate-400">
                <div className="container mx-auto px-4 text-center text-xs leading-relaxed">
                    <div className="mb-6 flex items-center justify-center gap-2">
                        <div className="flex flex-col items-center leading-none text-center">
                            <span className="text-2xl font-black tracking-tighter text-white">
                                COCO ALBA B2B
                            </span>
                        </div>
                    </div>
                    <div className="space-y-1 mb-6">
                        <p>상호: 초코아이디어 | 대표자명: 김대순 외 1명 | 사업자등록번호: 226-13-91078</p>
                        <p>주소: 경기도 평택시 지산로12번길 93, 2층(지산동)</p>
                        <p>고객센터: 1877-1442 (평일 09:00 ~ 18:00) | 이메일: bizsetter7@gmail.com</p>
                    </div>
                    <div className="text-slate-600 text-[10px]">
                        <p className="mb-1">© 2026 COCOALBA B2B. All Rights Reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// [Simulation] Coordinate ranges for Seoul area
const SEOUL_COORDS = { lat: 37.5665, lng: 126.9780 };

function HomeContent() {
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const { lat: userLat, lng: userLng, calculateDistance } = useLocation();

  const processedShops = useMemo(() => {
    if (isPreRelease) return []; // Block memory processing and network exposure in PRE_RELEASE mode

    let rawShops = (shopsData as Shop[]).map((shop, index) => {
      let tier: Shop['tier'] = shop.tier || 'common';
      if (tier === 'basic') tier = 'common';

      if (tier === 'common') {
        if (index % 100 === 5) tier = 'deluxe';
        else if (index % 100 === 10) tier = 'special';
        else if (index % 100 === 15) tier = 'urgent';
        else if (index % 100 === 20) tier = 'recommended';
        else if (index % 100 === 25) tier = 'native';
      }
      if (tier === 'grand' && index % 3 === 1) tier = 'premium';

      const currentTitle = shop.title || shop.name;
      const shopName = shop.name;
      const workType = shop.workType;
      const category = shop.category;
      const description = shop.description;
      const paySuffixes = shop.options?.paySuffixes || [];

      let currentOptions = { ...shop.options, paySuffixes };

      if (!currentOptions.mediaUrl && (tier === 'grand' || tier === 'premium')) {
        currentOptions = {
          ...currentOptions,
          mediaUrl: `https://picsum.photos/400/300?random=${index}`
        };
      }

      let lat = shop.lat;
      let lng = shop.lng;
      if (!lat) {
        lat = SEOUL_COORDS.lat + (Math.sin(index) * 0.05);
        lng = SEOUL_COORDS.lng + (Math.cos(index) * 0.05);
      }

      return { ...shop, tier, title: currentTitle, name: shopName, workType, category, description, options: currentOptions, lat, lng };
    });

    if (userLat && userLng) {
      rawShops = rawShops.sort((a, b) => {
        const aPriority = (a.tier === 'grand' || a.tier === 'premium') ? 0 : 1;
        const bPriority = (b.tier === 'grand' || b.tier === 'premium') ? 0 : 1;
        if (aPriority !== bPriority) return aPriority - bPriority;
        const distA = calculateDistance(userLat, userLng, a.lat!, a.lng!);
        const distB = calculateDistance(userLat, userLng, b.lat!, b.lng!);
        return distA - distB;
      });
    }

    return rawShops;
  }, [userLat, userLng, calculateDistance]);

  // PG Audit Mode: Completely hide actual service in PRE_RELEASE
  if (isPreRelease) {
    return <B2BLandingPage />;
  }

  if (page === 'login') {
    return <LoginPage />;
  }

  if (page === 'signup') {
    return <SignupPage />;
  }

  if (page === 'support' || page === 'faq' || page === 'inquiry') {
    return <CustomerCenterContent />;
  }

  return <HomeClient shops={processedShops} />;
}

export default function HomePortal() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
