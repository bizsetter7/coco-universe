import React from 'react';
import RegionClient from './RegionClient';
import shopsData from '@/lib/data/shops.json';
import { Shop } from '@/types/shop';

export default function RegionPage() {
    // Cast json data to Shop[]
    const shops = shopsData as Shop[];

    return <RegionClient shops={shops} />;
}
