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

// B2B Landing (Removed because Audit Mode is handled in layout.tsx)

// [Simulation] Coordinate ranges for Seoul area
const SEOUL_COORDS = { lat: 37.5665, lng: 126.9780 };

const HomeContent = () => {
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
