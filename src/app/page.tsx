'use client'; // Deploy Version: 2026-04-08 수복판

import React, { useMemo, Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import HomeClient from '@/components/home/HomeClient';
import shopsData from '@/lib/data/shops.json';
import { Shop } from '@/types/shop';
import { useLocation } from '@/hooks/useLocation';
import { ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { enrichAdData } from '@/lib/adUtils';
import { supabase } from '@/lib/supabase';

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

  const [dbShops, setDbShops] = useState<any[]>([]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .eq('status', 'active')
          .order('updated_at', { ascending: false });
          
        if (!error && data) {
          setDbShops(data);
        }
      } catch (err) {
        console.error('Failed to fetch shops:', err);
      }
    };
    fetchShops();
  }, []);

  const processedShops = useMemo(() => {
    // DB 데이터가 없으면 shops.json을 fallback으로 사용
    const dataSource = dbShops.length > 0 ? dbShops : shopsData;

    // 1. 데이터 통합 정제
    const allEnriched = dataSource.map((ad: any) => enrichAdData(ad, []));

    // [Fix 2] p1~p7 실제 tier 기준 정렬 헬퍼 (구버전 grand/premium 호환 포함)
    const getTierRank = (tier: string): number => {
      const t = (tier || '').toLowerCase();
      const ORDER: Record<string, number> = {
        p1: 1, grand: 1, vip: 1,
        p2: 2, premium: 2,
        p3: 3, deluxe: 3,
        p4: 4, special: 4,
        p5: 5, urgent: 5, recommended: 5,
        p6: 6, native: 6,
        p7: 7, basic: 7, common: 7,
      };
      return ORDER[t] ?? 99;
    };

    const isMockAd = (ad: any): boolean =>
      ad.isMock === true ||
      String(ad.user_id || '').startsWith('6fc68887') ||
      String(ad.id || '').startsWith('AD_MOCK_');

    // 2. 실제 광고 / 목업 분리
    const reals = allEnriched.filter((s: any) => !isMockAd(s));
    const mocks = allEnriched.filter((s: any) => isMockAd(s));

    // 3. 실제 광고 수만큼 목업 뒤에서 제거
    const visibleMocks = reals.length > 0
      ? mocks.slice(0, Math.max(0, mocks.length - reals.length))
      : mocks;

    // 4. 실제광고는 tier 무관하게 목업보다 항상 앞에 표시
    const sortByTierDate = (arr: any[]) => arr.sort((a: any, b: any) => {
      const aRank = getTierRank(a.tier);
      const bRank = getTierRank(b.tier);
      if (aRank !== bRank) return aRank - bRank;
      return new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime();
    });
    return [...sortByTierDate(reals), ...sortByTierDate(visibleMocks)];
  }, [userLat, userLng, dbShops]);

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
