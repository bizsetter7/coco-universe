'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBrand } from '@/components/BrandProvider';
import { Shop } from '@/types/shop';
import { PaymentPopup } from './PaymentPopup';
import JobDetailModal from '@/components/jobs/JobDetailModal';

// Restore Imports
import { HeroSection } from './HeroSection';
import { CommunityNotice } from './CommunityNotice';
import { QuickMenu } from './QuickMenu';
import { UnifiedAdGrid } from '@/components/common/UnifiedAdGrid';
import JobListView from '@/components/jobs/JobListView';

// --- Type Definitions ---
interface HomeClientProps {
    shops: Shop[];
}

export default function HomeClient({ shops }: HomeClientProps) {
    const brand = useBrand();
    const router = useRouter();

    // -- State --
    const [visibleCount, setVisibleCount] = React.useState(20);
    const [selectedShop, setSelectedShop] = React.useState<Shop | null>(null);
    const [showPaymentPopup, setShowPaymentPopup] = React.useState(false);
    const [selectedTier, setSelectedTier] = React.useState('grand');
    const [favorites, setFavorites] = React.useState<string[]>([]);

    // -- Handlers --
    const toggleFavorite = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newFavs = favorites.includes(id)
            ? favorites.filter(fid => fid !== id)
            : [...favorites, id];
        setFavorites(newFavs);
        localStorage.setItem('favorites', JSON.stringify(newFavs));
    };

    const handleAdRegister = (tier?: string) => {
        setSelectedTier(tier || 'grand');
        setShowPaymentPopup(true);
    };

    return (
        <div className="w-full pb-20">
            {/* 1. Top Section: Hero (Carousel), Quick Menu, Community */}
            <section className="mb-4">
                <HeroSection />

                {/* Visual Offset: Lift QuickMenu up */}
                <div className="-mt-4 relative z-10">
                    <QuickMenu />
                </div>

                <div className="mt-2 px-4 xl:px-0">
                    <CommunityNotice />
                </div>
            </section>

            <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-10" />

            {/* 2. Ad Sections (Now Unified) */}
            <UnifiedAdGrid
                shops={shops}
                onAdRegister={handleAdRegister}
                onSelectShop={setSelectedShop}
            />

            <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-10" />

            {/* 3. Job List (Table/Cards) */}
            <JobListView
                shops={shops}
                brand={brand}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                setSelectedShop={setSelectedShop}
                visibleCount={visibleCount}
                setVisibleCount={setVisibleCount}
                onAdRegister={handleAdRegister}
                onNativeAdRegister={handleAdRegister}
            />

            {/* Payment Modal */}
            {showPaymentPopup && (
                <PaymentPopup
                    isOpen={showPaymentPopup}
                    onClose={() => setShowPaymentPopup(false)}
                    initialTier={selectedTier}
                />
            )}

            {/* Job Detail Modal */}
            {selectedShop && (
                <JobDetailModal
                    shop={selectedShop}
                    onClose={() => setSelectedShop(null)}
                    isFavorite={favorites.includes(selectedShop.id)}
                    onToggleFavorite={(e, id) => toggleFavorite(e, id)}
                />
            )}
        </div>
    );
}
