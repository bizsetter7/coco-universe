'use client';

import React, { useMemo } from 'react';
import HomeClient from '@/components/home/HomeClient';
import shopsData from '@/lib/data/shops.json';
import { Shop } from '@/types/shop';

export default function HomePortal() {
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

  return <HomeClient shops={processedShops} />;
}
