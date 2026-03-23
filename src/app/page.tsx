'use client'; // Deploy Version: 2026-03-14

import React, { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HomeClient from '@/components/home/HomeClient';
import shopsData from '@/lib/data/shops.json';
import { Shop } from '@/types/shop';
import { LoginPage } from '@/components/auth/LoginPage';
import { SignupPage } from '@/components/auth/SignupPage';
import { FindAccountPage } from '@/components/auth/FindAccountPage';
import { CustomerCenterContent } from '@/app/customer-center/page';
import { useLocation } from '@/hooks/useLocation';
import { isPreRelease } from '@/lib/config';
import { ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

// B2B Landing (Removed because Audit Mode is handled in layout.tsx)

// [Simulation] Coordinate ranges for Seoul area
const SEOUL_COORDS = { lat: 37.5665, lng: 126.9780 };

const HomeContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const { lat: userLat, lng: userLng, calculateDistance } = useLocation();

  const processedShops = useMemo(() => {
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

    // [Feature] 자연스러운 티어별 정렬 및 시간/거리순 정렬 적용
    rawShops = rawShops.sort((a, b) => {
      const TIER_ORDER = ['vip', 'grand', 't1', 'premium', 't2', 'deluxe', 't3', 'special', 't4', 'urgent', '급구', 't5', 'recommended', '추천', 't6', 'basic', '일반', 't7', 'common'];
      
      const getRank = (tier: string) => {
        const idx = TIER_ORDER.indexOf((tier || '').toLowerCase());
        return idx === -1 ? 99 : idx;
      };

      const aRank = getRank(a.tier!);
      const bRank = getRank(b.tier!);
      
      // 1. 광고 등급(티어)이 다르면 티어 우선순위로만 정렬 (상위 티어 보호)
      if (aRank !== bRank) return aRank - bRank;

      // 2. 점프(또는 생성) 시간 우선 정렬 (최신 순)
      const aRaw = a as any;
      const bRaw = b as any;
      const aTime = new Date(aRaw.created_at || aRaw.updated_at || aRaw.createdAt || aRaw.updatedAt || aRaw.date || 0).getTime();
      const bTime = new Date(bRaw.created_at || bRaw.updated_at || bRaw.createdAt || bRaw.updatedAt || bRaw.date || 0).getTime();
      
      if (aTime !== bTime && (aTime > 0 && bTime > 0)) {
          return bTime - aTime;
      }

      // 3. 사용자 위치 기반 거리순 정렬 (좌표 허용 시)
      if (userLat && userLng && a.lat && a.lng && b.lat && b.lng) {
          const distA = calculateDistance(userLat, userLng, a.lat, a.lng);
          const distB = calculateDistance(userLat, userLng, b.lat, b.lng);
          return distA - distB;
      }

      return 0;
    });

    return rawShops;
  }, [userLat, userLng, calculateDistance]);

  if (page === 'login') {
    return <LoginPage />;
  }

  if (page === 'signup') {
    return <SignupPage />;
  }

  if (page === 'find-id' || page === 'find-pw') {
    return <FindAccountPage initialTab={page as 'find-id' | 'find-pw'} />;
  }

  if (page === 'support' || page === 'faq' || page === 'inquiry') {
    return <CustomerCenterContent />;
  }

  return <HomeClient shops={processedShops} />;
}

export default function HomePortal() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
