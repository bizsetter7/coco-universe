'use client'; // Deploy Version: 2026-02-04-02-35 (Forced Redeploy)

import React, { useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HomeClient from '@/components/home/HomeClient';
import shopsData from '@/lib/data/shops.json';
import { Shop } from '@/types/shop';
import { LoginPage } from '@/components/auth/LoginPage';
import { CustomerCenterContent } from '@/app/customer-center/page';

function HomeContent() {
  const searchParams = useSearchParams();
  const page = searchParams.get('page');

  // [Logic Preserved] - Distribute tiers based on index to simulate a rich DB
  const processedShops = useMemo(() => {
    return (shopsData as Shop[]).map((shop, index) => {
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

      return { ...shop, tier };
    });
  }, []);

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
