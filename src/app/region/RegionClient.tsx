'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// Components
import LeftSidebar from '@/components/LeftSidebar';

import JobDetailModal from '@/components/jobs/JobDetailModal';
import { PaymentPopup } from '@/components/home/PaymentPopup';
import { WorkTypeGuideLinks } from '@/components/guide/WorkTypeGuideLinks';

// Types & Data
import { Shop } from '@/types/shop';
import { useBrand } from '@/components/BrandProvider';
import { useAuth } from '@/hooks/useAuth';
import { REGION_BRACKET_MAP } from '@/constants/regions';
import { JOB_CATEGORY_MAP } from '@/constants/jobs';
import { ListingPageLayout } from '@/components/ListingPageLayout';
import { UnifiedJobListing } from '@/components/listing/UnifiedJobListing';
import { UnifiedAdGrid } from '@/components/common/UnifiedAdGrid';
import { getFavorites, toggleFavorite as toggleFav, saveShopSnapshot } from '@/utils/favorites';

interface RegionClientProps {
    shops: Shop[];
    initialRegion?: string;
    regionSlug?: string;
}

export default function RegionClient({ shops, initialRegion = '전체', regionSlug }: RegionClientProps) {
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
        // [BUG-05 FIX] 비로그인 상태에서 즐겨찾기 클릭 시 로그인 페이지로 이동
        if (!isLoggedIn) {
            router.push('/?page=login');
            return;
        }
        const shop = shops?.find(s => s.id === id);
        if (shop) saveShopSnapshot(id, shop);
        setFavorites(prev => toggleFav(id, prev));
    }, [shops, isLoggedIn, router]);

    // [GeoTargeting] viewed_shops 기반 홈 지역 감지 (전체 뷰에서 해당 지역 광고 우선 노출)
    const homeRegion = useMemo(() => {
        try {
            const saved = localStorage.getItem('viewed_shops');
            if (!saved) return null;
            const entries: { shop: Shop; timestamp: number }[] = JSON.parse(saved);
            const regionCount: Record<string, number> = {};
            entries.forEach(e => {
                const r = e.shop?.region;
                if (r) regionCount[r] = (regionCount[r] || 0) + 1;
            });
            const top = Object.entries(regionCount).sort((a, b) => b[1] - a[1])[0];
            return top?.[0] || null;
        } catch { return null; }
    }, []);

    // Data Filtering
    const filteredShops = useMemo(() => {
        if (!shops) return [];
        const filtered = shops.filter(shop => {
            // Region Filter (전체명 → shops.json 약칭 변환 후 substring 검색)
            if (selectedRegion !== '전체') {
                const bracketKey = REGION_BRACKET_MAP[selectedRegion] || selectedRegion;
                if (!(shop.region?.includes(bracketKey))) return false;
            }
            if (selectedSubRegion !== '전체' && !(shop.region?.includes(selectedSubRegion))) return false;
            // Job Type Filter (부모 카테고리 또는 서브카테고리 매칭)
            // workType 형식: "부모명" 또는 "부모명-서브명" (대소문자 혼재 가능)
            if (selectedJobType !== '전체') {
                const subTypes = JOB_CATEGORY_MAP[selectedJobType] || [];
                const wt = (shop.workType || '').toLowerCase();
                const sjt = selectedJobType.toLowerCase();
                // 정확한 부모 매칭: workType === parent 또는 "parent-xxx" 형태
                const matchesParent = wt === sjt || wt.startsWith(sjt + '-');
                // 서브카테고리 매칭 (대소문자 무시)
                const matchesChild = subTypes.some(sub => sub && wt.includes(sub.toLowerCase()));
                if (!matchesParent && !matchesChild) return false;
            }
            if (selectedSubJobType !== '전체' && !(shop.workType?.toLowerCase().includes(selectedSubJobType.toLowerCase()))) return false;
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

        // [GeoTargeting] 전체 뷰 + 홈 지역 감지된 경우 → 홈 지역 광고를 tier 내 상단으로 boost
        if (selectedRegion === '전체' && homeRegion) {
            filtered.sort((a, b) => {
                const aMatch = a.region?.includes(homeRegion) ? 0 : 1;
                const bMatch = b.region?.includes(homeRegion) ? 0 : 1;
                return aMatch - bMatch;
            });
        }

        return filtered;
    }, [shops, selectedRegion, selectedSubRegion, selectedJobType, selectedSubJobType, activeSearchQuery, homeRegion]);

    // [BUG-04 FIX] LeftSidebar에서 직종 변경 시 subJobType도 함께 리셋
    // LeftSidebar에는 setSelectedSubJobType prop이 없어 잔류값이 필터를 오염시키는 버그 수정
    const handleSetSelectedJobType = React.useCallback((v: string) => {
        setSelectedJobType(v);
        setSelectedSubJobType('전체');
    }, []);

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
                        setSelectedJobType={handleSetSelectedJobType}
                        onPaymentClick={openPaymentPopup}
                        isLoggedIn={isLoggedIn}
                        userType={userType as any}
                        userName={userName}
                        userCredit={userCredit}
                    />
                }>
                    {/* 지역 가이드 — 필터 선택 시 동적 업데이트, 미선택 시 URL regionSlug 기본값 */}
                    {(() => {
                        const dynamicSlug = selectedRegion !== '전체' ? selectedRegion : regionSlug;
                        return dynamicSlug ? <WorkTypeGuideLinks regionSlug={dynamicSlug} /> : null;
                    })()}

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
                        activeSearchQuery={activeSearchQuery}
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
