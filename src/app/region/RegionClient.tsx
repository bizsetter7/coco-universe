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
import { useAuth } from '@/hooks/useAuth';
import { ListingPageLayout } from '@/components/ListingPageLayout';
import { UnifiedJobListing } from '@/components/listing/UnifiedJobListing';
import { UnifiedAdGrid } from '@/components/common/UnifiedAdGrid';

interface RegionClientProps {
    shops: Shop[];
    initialRegion?: string;
}

export default function RegionClient({ shops, initialRegion = '전체' }: RegionClientProps) {
    const brand = useBrand();
    const router = useRouter();
    const { isLoggedIn, userType, userName, userPoints } = useAuth();

    // -- State --
    const [selectedRegion, setSelectedRegion] = useState(initialRegion);
    const [selectedSubRegion, setSelectedSubRegion] = useState('전체');
    const [selectedJobType, setSelectedJobType] = useState('전체');
    const [selectedSubJobType, setSelectedSubJobType] = useState('전체');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSearchQuery, setActiveSearchQuery] = useState('');

    const [visibleCount, setVisibleCount] = useState(20);
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [selectedTier, setSelectedTier] = useState('grand');

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

    // Data Filtering
    const filteredShops = useMemo(() => {
        if (!shops) return [];
        return shops.filter(shop => {
            if (selectedRegion !== '전체' && !(shop.region?.includes(selectedRegion))) return false;
            if (selectedSubRegion !== '전체' && !(shop.region?.includes(selectedSubRegion))) return false;
            if (selectedJobType !== '전체' && !(shop.workType?.includes(selectedJobType))) return false;
            if (selectedSubJobType !== '전체' && !(shop.workType?.includes(selectedSubJobType))) return false;
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
        <div className={`min-h-screen ${brand.theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} pb-24 lg:pb-0`}>


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
                        isLoggedIn={isLoggedIn}
                        userType={userType as any}
                        userName={userName}
                        userPoints={userPoints}
                    />
                }>
                    {/* Unified Listing Content with Ad Grid Injected */}
                    <UnifiedJobListing
                        title="지역별 채용"
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
                                onSelectShop={setSelectedShop as any}
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
                        filterOrder={['region', 'subRegion', 'job', 'subJob']} // Custom order for Region page
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

            {showPaymentPopup && (
                <PaymentPopup
                    isOpen={showPaymentPopup}
                    onClose={() => setShowPaymentPopup(false)}
                    initialTier={selectedTier}
                />
            )}
        </div>
    );
}
