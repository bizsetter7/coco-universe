'use client'; // Deploy Version: 2026-04-08 수복판

import React, { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import HomeClient from '@/components/home/HomeClient';
import shopsData from '@/lib/data/shops.json';
import { Shop } from '@/types/shop';
import { useLocation } from '@/hooks/useLocation';
import { ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { enrichAdData } from '@/lib/adUtils';

const LoginPage = dynamic(() => import('@/components/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = dynamic(() => import('@/components/auth/SignupPage').then(m => ({ default: m.SignupPage })));
const FindAccountPage = dynamic(() => import('@/components/auth/FindAccountPage').then(m => ({ default: m.FindAccountPage })));
const CustomerCenterContent = dynamic(() => import('@/app/customer-center/page').then(m => ({ default: m.CustomerCenterContent })));

// [Simulation] Coordinate ranges for Seoul area
const SEOUL_COORDS = { lat: 37.5665, lng: 126.9780 };

const HomeContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const { lat: userLat, lng: userLng, calculateDistance } = useLocation();

  const processedShops = useMemo(() => {
    // 1. 데이터 통합 정제 (통합 어댑터 adUtils 적용)
    // 실제 운영 시에는 여기서 Supabase API로 실데이터를 가져오나, 현재는 shopsData와 병합 구조
    const allEnriched = (shopsData as any[]).map((ad: any) => enrichAdData(ad, []));

    // 2. 정렬 로직 (티어순 -> 실데이터 우선 -> 최신순)
    const sorted = allEnriched.sort((a, b) => {
      const TIER_ORDER = ['vip', 'grand', 't1', 'premium', 't2', 'deluxe', 't3', 'special', 't4', 'urgent', '급구', 't5', 'recommended', '추천', 't6', 'basic', '일반', 't7', 'common'];
      
      const getRank = (tier: string) => {
        const idx = TIER_ORDER.indexOf((tier || '').toLowerCase());
        return idx === -1 ? 99 : idx;
      };

      const aRank = getRank(a.tier!);
      const bRank = getRank(b.tier!);
      
      if (aRank !== bRank) return aRank - bRank;

      const aIsMock = (a as any).isMock || false;
      const bIsMock = (b as any).isMock || false;
      if (aIsMock !== bIsMock) return aIsMock ? 1 : -1;

      const aTime = new Date((a as any).created_at || (a as any).date || 0).getTime();
      const bTime = new Date((b as any).created_at || (b as any).date || 0).getTime();
      return bTime - aTime;
    });

    // 3. 목업 정리 로직 (실제 공고 개수만큼 하단 목업 제거)
    const reals = sorted.filter(s => !s.isMock);
    const mocks = sorted.filter(s => s.isMock);
    const realCount = reals.length;
    
    if (realCount > 0) {
      const truncatedMocks = mocks.slice(0, Math.max(0, mocks.length - realCount));
      return [...reals, ...truncatedMocks].sort((a, b) => {
          const getRank = (tier: string) => {
            const TIER_ORDER = ['vip', 'grand', 't1', 'premium', 't2', 'deluxe', 't3', 'special', 't4', 'urgent', '급구', 't5', 'recommended', '추천', 't6', 'basic', '일반', 't7', 'common'];
            const idx = TIER_ORDER.indexOf((tier || '').toLowerCase());
            return idx === -1 ? 99 : idx;
          };
          const aRank = getRank(a.tier!);
          const bRank = getRank(b.tier!);
          if (aRank !== bRank) return aRank - bRank;
          const aIsMock = (a as any).isMock || false;
          const bIsMock = (b as any).isMock || false;
          if (aIsMock !== bIsMock) return aIsMock ? 1 : -1;
          const aTime = new Date((a as any).created_at || (a as any).date || 0).getTime();
          const bTime = new Date((b as any).created_at || (b as any).date || 0).getTime();
          return bTime - aTime;
      });
    }

    return sorted;
  }, [userLat, userLng]);

  if (page === 'login') return <LoginPage />;
  if (page === 'signup') return <SignupPage />;
  if (page === 'find-id' || page === 'find-pw') return <FindAccountPage initialTab={page as 'find-id' | 'find-pw'} />;
  if (page === 'support' || page === 'faq' || page === 'inquiry') return <CustomerCenterContent />;

  return <HomeClient shops={processedShops} />;
};

export default function HomePortal() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
