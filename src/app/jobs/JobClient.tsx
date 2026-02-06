'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Components
import LeftSidebar from '@/components/LeftSidebar';

import JobDetailModal from '@/components/jobs/JobDetailModal';
import { PaymentPopup } from '@/components/home/PaymentPopup';

// Types & Data
import { Shop } from '@/types/shop';
import { useBrand } from '@/components/BrandProvider';
import { ListingPageLayout } from '@/components/ListingPageLayout';
import { UnifiedJobListing } from '@/components/listing/UnifiedJobListing';
import { UnifiedAdGrid } from '@/components/common/UnifiedAdGrid';

interface JobClientProps {
    shops: Shop[];
    jobTypes: string[];
}

export default function JobClient({ shops, jobTypes }: JobClientProps) {
    const brand = useBrand();
    const router = useRouter();

    // -- State --
    const [selectedRegion, setSelectedRegion] = useState('전체');
    const [selectedSubRegion, setSelectedSubRegion] = useState('전체');
    const [selectedJobType, setSelectedJobType] = useState('전체');
    const [selectedSubJobType, setSelectedSubJobType] = useState('전체');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSearchQuery, setActiveSearchQuery] = useState('');

    // Pagination / Limits
    const [visibleCount, setVisibleCount] = useState(20);

    // Modal & Menu State
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

    // Favorites State
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('favorites');
        if (saved) setFavorites(JSON.parse(saved));
    }, []);

    const toggleFavorite = React.useCallback((e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setFavorites(prev => {
            const newFavs = prev.includes(id)
                ? prev.filter(fid => fid !== id)
                : [...prev, id];
            localStorage.setItem('favorites', JSON.stringify(newFavs));
            return newFavs;
        });
    }, []);

    // Payment Popup State
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [selectedTier, setSelectedTier] = useState('grand');

    // -- Data Filtering --
    const filteredShops = useMemo(() => {
        return shops.filter(shop => {
            // Region Filter
            if (selectedRegion !== '전체' && !(shop.region?.includes(selectedRegion))) return false;
            if (selectedSubRegion !== '전체' && !(shop.region?.includes(selectedSubRegion))) return false;

            // Job Type Filter
            if (selectedJobType !== '전체' && !(shop.workType?.includes(selectedJobType))) return false;
            if (selectedSubJobType !== '전체' && !(shop.workType?.includes(selectedSubJobType))) return false;

            // Search Query Filter
            if (activeSearchQuery) {
                const query = activeSearchQuery.toLowerCase();
                const matchName = shop.name.toLowerCase().includes(query) || (shop.realName && shop.realName.toLowerCase().includes(query));
                const matchRegion = shop.region.toLowerCase().includes(query);
                const matchType = shop.workType.toLowerCase().includes(query);
                const matchTitle = shop.title && shop.title.toLowerCase().includes(query);

                if (!matchName && !matchRegion && !matchType && !matchTitle) return false;
            }

            return true;
        });
    }, [shops, selectedRegion, selectedSubRegion, selectedJobType, selectedSubJobType, activeSearchQuery]);

    const openPaymentPopup = React.useCallback((tier: string) => {
        setSelectedTier(tier);
        setShowPaymentPopup(true);
    }, []);

    return (
        <div className={`w-full h-auto ${brand.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>



            <div className="pt-0">
                <ListingPageLayout sidebar={
                    <LeftSidebar
                        selectedRegion={selectedRegion}
                        setSelectedRegion={setSelectedRegion}
                        setSelectedSubRegion={setSelectedSubRegion}
                        selectedJobType={selectedJobType}
                        setSelectedJobType={setSelectedJobType}
                        onLoginClick={() => router.push('/?page=login')}
                        onSignupClick={() => router.push('/?page=signup')}
                        onPaymentClick={openPaymentPopup}
                    />
                }>
                    {/* Unified Listing Content with Ad Grid Injected */}
                    <UnifiedJobListing
                        title="업종별 채용"
                        shops={filteredShops}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                        setSelectedShop={setSelectedShop}
                        visibleCount={visibleCount}
                        setVisibleCount={setVisibleCount}
                        onAdRegister={() => openPaymentPopup('basic')}
                        onNativeAdRegister={() => openPaymentPopup('native')}

                        // Pass Ad Grid here
                        adGrid={
                            <UnifiedAdGrid
                                shops={shops}
                                onAdRegister={openPaymentPopup}
                                onSelectShop={setSelectedShop}
                                columns={3}
                            />
                        }

                        selectedRegion={selectedRegion}
                        setSelectedRegion={setSelectedRegion}
                        selectedSubRegion={selectedSubRegion}
                        setSelectedSubRegion={setSelectedSubRegion}
                        selectedJobType={selectedJobType}
                        setSelectedJobType={setSelectedJobType}
                        selectedSubJobType={selectedSubJobType}
                        setSelectedSubJobType={setSelectedSubJobType}

                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        setActiveSearchQuery={setActiveSearchQuery}
                    />
                </ListingPageLayout>
            </div>

            {/* Modals */}
            {selectedShop && (
                <JobDetailModal
                    shop={selectedShop}
                    onClose={() => setSelectedShop(null)}
                    isFavorite={favorites.includes(selectedShop.id)}
                    onToggleFavorite={(e) => toggleFavorite(e, selectedShop.id)}
                />
            )}

            <PaymentPopup
                isOpen={showPaymentPopup}
                onClose={() => setShowPaymentPopup(false)}
                initialTier={selectedTier}
            />
        </div>
    );
}
