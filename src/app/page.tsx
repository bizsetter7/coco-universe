'use client'; // Deploy Version: 2026-02-04-02-35 (Forced Redeploy)

import React, { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HomeClient from '@/components/home/HomeClient';
import shopsData from '@/lib/data/shops.json';
import { Shop } from '@/types/shop';
import { LoginPage } from '@/components/auth/LoginPage';
import { SignupPage } from '@/components/auth/SignupPage';
import { CustomerCenterContent } from '@/app/customer-center/page';
import { useLocation } from '@/hooks/useLocation';
import { AUDIT_MODE } from '@/lib/brand-config';
import { AuditLanding } from '@/components/audit/AuditLanding';

// [Simulation] Coordinate ranges for Seoul area
const SEOUL_COORDS = { lat: 37.5665, lng: 126.9780 };

function HomeContent() {
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const { lat: userLat, lng: userLng, calculateDistance } = useLocation();

  const processedShops = useMemo(() => {
    let rawShops = (shopsData as Shop[]).map((shop, index) => {
      let tier: Shop['tier'] = shop.tier || 'common';
      if (tier === 'basic') tier = 'common';

      // ... existing tier distribution ...
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

      const effects = ['[네온]', '[무지개]', '[반짝]', '[GIF]', '[HOT]'];
      let currentOptions = { ...shop.options, paySuffixes };

      if ((tier === 'grand' || tier === 'premium')) {
        const effect = effects[index % effects.length];
        // Note: Title can be modified with effects if desired externally
      }

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

  // PG Audit Mode: Always show static landing if enabled
  if (AUDIT_MODE) {
    return <AuditLanding />;
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
