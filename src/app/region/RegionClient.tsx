'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// Components
import LeftSidebar from '@/components/LeftSidebar';

import JobDetailModal from '@/components/jobs/JobDetailModal';
import { PaymentPopup } from '@/components/home/PaymentPopup';

// Types & Data
import { Shop } from '@/types/shop';
import { useBrand } from '@/components/BrandProvider';
import { useAuth } from '@/hooks/useAuth';
import { REGION_BRACKET_MAP } from '@/constants/regions';
import { ListingPageLayout } from '@/components/ListingPageLayout';
import { UnifiedJobListing } from '@/components/listing/UnifiedJobListing';
import { UnifiedAdGrid } from '@/components/common/UnifiedAdGrid';
import { getFavorites, toggleFavorite as toggleFav } from '@/utils/favorites';

interface RegionClientProps {
    shops: Shop[];
    initialRegion?: string;
}

export default function RegionClient({ shops, initialRegion = '전체' }: RegionClientProps) {
    const brand = useBrand();
    const router = useRouter();
    const { isLoggedIn, userType, userName, userCredit } = useAuth();

    // -- State --
    const [selectedRegion, setSelectedRegion] = useState(initialRegion);
    const [selectedSubRegion, setSelectedSubRegion] = useState('전체');
    const [selectedJobType, setSelectedJobType] = useState('전체');
    const [selectedSubJobType, setSelectedSubJobType] = useState('전체');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSearchQuery, setActiveSearchQuery] = useState('');

    const [visibleCount, setVisibleCount] = useState(20);
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

    // Track viewed shops (타임스탬프 포함 저장 → 24시간 후 자동 만료)
    const handleSetSelectedShop = React.useCallback((shop: Shop | null) => {
        setSelectedShop(shop);
        if (shop) {
            const saved = localStorage.getItem('viewed_shops');
            const now = Date.now();
            const MS_24H = 86400000;
            let entries: { shop: Shop; timestamp: number }[] = [];
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // 구형 포맷(Shop[]) 호환 처리
                    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
                        entries = (parsed as Shop[]).map(s => ({ shop: s, timestamp: now }));
                    } else {
                        entries = parsed;
                    }
                } catch { entries = []; }
            }
            // 24시간 이내 + 중복 제거 + 최신 상단
            entries = [
                { shop, timestamp: now },
                ...entries.filter(e => e.shop?.id !== shop.id && (now - e.timestamp) < MS_24H),
            ].slice(0, 50);
            localStorage.setItem('viewed_shops', JSON.stringify(entries));
        }
    }, []);

    const [favorites, setFavorites] = useState<string[]>(() => getFavorites());
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [selectedTier, setSelectedTier] = useState('grand');

    const toggleFavorite = React.useCallback((e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setFavorites(prev => toggleFav(id, prev));
    }, []);

    // Data Filtering
    const filteredShops = useMemo(() => {
        if (!shops) return [];
        return shops.filter(shop => {
            // Region Filter (전체명 → shops.json 약칭 변환 후 substring 검색)
            if (selectedRegion !== '전체') {
                const bracketKey = REGION_BRACKET_MAP[selectedRegion] || selectedRegion;
                if (!(shop.region?.includes(bracketKey))) return false;
            }
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
                        onPaymentClick={openPaymentPopup}
                        isLoggedIn={isLoggedIn}
                        userType={userType as any}
                        userName={userName}
                        userCredit={userCredit}
                    />
                }>
                    {/* Unified Listing Content with Ad Grid Injected */}
                    <UnifiedJobListing
                        title="지역별 채용"
                        shops={filteredShops}
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                        setSelectedShop={handleSetSelectedShop}
                        visibleCount={visibleCount}
                        setVisibleCount={setVisibleCount}
                        onAdRegister={() => openPaymentPopup('basic')}
                        onNativeAdRegister={() => openPaymentPopup('native')}

                        // Pass Ad Grid here
                        adGrid={
                            <UnifiedAdGrid
                                shops={shops}
                                onAdRegister={openPaymentPopup}
                                onSelectShop={handleSetSelectedShop as any}
                                hasSidebar={true}
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
