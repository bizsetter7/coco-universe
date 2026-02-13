'use client'; // Deploy Version: 2026-02-04-02-35 (Forced Redeploy)

import React, { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HomeClient from '@/components/home/HomeClient';
import shopsData from '@/lib/data/shops.json';
import { Shop } from '@/types/shop';
import { LoginPage } from '@/components/auth/LoginPage';
import { CustomerCenterContent } from '@/app/customer-center/page';
import { useLocation } from '@/hooks/useLocation';

// [Simulation] Coordinate ranges for Seoul area
const SEOUL_COORDS = { lat: 37.5665, lng: 126.9780 };

function HomeContent() {
  const searchParams = useSearchParams();
  const page = searchParams.get('page');
  const { lat: userLat, lng: userLng, calculateDistance } = useLocation();

  // [Logic Preserved] - Distribute tiers based on index to simulate a rich DB
  const processedShops = useMemo(() => {
    let rawShops = (shopsData as Shop[]).map((shop, index) => {
      let tier: Shop['tier'] = shop.tier || 'common';
      if (tier === 'basic') tier = 'common';

      // Random tier distribution logic from original file
      if (tier === 'common') {
        if (index % 100 === 5) tier = 'deluxe';
        else if (index % 100 === 10) tier = 'special';
        else if (index % 100 === 15) tier = 'urgent';
        else if (index % 100 === 20) tier = 'recommended';
        else if (index % 100 === 25) tier = 'native';
      }

      // Distribute Grand/Premium
      if (tier === 'grand' && index % 3 === 1) tier = 'premium';

      // [Dynamic Ad Enhancement] Inject tags for Tier display
      let title = shop.title || shop.name;
      const effects = ['[네온]', '[무지개]', '[반짝]', '[GIF]', '[HOT]'];

      if (tier === 'grand' || tier === 'premium') {
        const effect = effects[index % effects.length];
        title = `${effect} ${title}`;

        const imgId = 100 + (index % 50);
        if (!shop.options?.mediaUrl) {
          shop.options = {
            ...shop.options,
            mediaUrl: `https://picsum.photos/400/300?random=${index}`
          };
        }
      }

      // [Hyper-local Simulation] Inject lat/lng if missing
      // We simulate spread around Seoul for demo purposes
      let lat = shop.lat;
      let lng = shop.lng;

      if (!lat) {
        // Semi-random deterministic coords based on index
        lat = SEOUL_COORDS.lat + (Math.sin(index) * 0.05);
        lng = SEOUL_COORDS.lng + (Math.cos(index) * 0.05);
      }

      return { ...shop, tier, title, lat, lng };
    });

    // [Signature - Hyper-local Logic]
    // If user location is available, priority sort by distance within same tier categories
    if (userLat && userLng) {
      rawShops = rawShops.sort((a, b) => {
        // 1. First priority: Grand/Premium tiers always stay top
        const aPriority = (a.tier === 'grand' || a.tier === 'premium') ? 0 : 1;
        const bPriority = (b.tier === 'grand' || b.tier === 'premium') ? 0 : 1;

        if (aPriority !== bPriority) return aPriority - bPriority;

        // 2. Same priority: Sort by distance
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
