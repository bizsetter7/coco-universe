'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBrand } from '@/components/BrandProvider';
import { Shop } from '@/types/shop';
import { PaymentPopup } from './PaymentPopup';
import JobDetailModal from '@/components/jobs/JobDetailModal';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

// Restore Imports
import { HeroSection } from './HeroSection';
import { CommunityNotice } from './CommunityNotice';
import { QuickMenu } from './QuickMenu';
import { UnifiedAdGrid } from '@/components/common/UnifiedAdGrid';
import JobListView from '@/components/jobs/JobListView';
import { FloatingConversion } from './FloatingConversion';
import { getFavorites, toggleFavorite as toggleFav, saveShopSnapshot } from '@/utils/favorites';
import { useAdultGate } from '@/hooks/useAdultGate';

// --- Type Definitions ---
interface HomeClientProps {
    shops: Shop[];
}

export default function HomeClient({ shops }: HomeClientProps) {
    const brand = useBrand();
    const router = useRouter();
    const { requireVerification } = useAdultGate();

    // -- State --
    const [visibleCount, setVisibleCount] = React.useState(20);
    const [selectedShop, setSelectedShop] = React.useState<Shop | null>(null);
    const [showPaymentPopup, setShowPaymentPopup] = React.useState(false);
    const [selectedTier, setSelectedTier] = React.useState('grand');
    const [favorites, setFavorites] = React.useState<string[]>(() => getFavorites());

    // Body Scroll Lock
    useBodyScrollLock(!!selectedShop || showPaymentPopup);

    // -- Handlers --
    const toggleFavorite = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const shop = (shops as any[])?.find((s: any) => s.id === id) || selectedShop;
        if (shop) saveShopSnapshot(id, shop);
        setFavorites(prev => toggleFav(id, prev));
    };

    const handleAdRegister = (tier?: string) => {
        requireVerification(() => {
            setSelectedTier(tier || 'grand');
            setShowPaymentPopup(true);
        });
    };

    return (
        <div className="w-full pb-20">
            {/* 1. Top Section: Hero (Carousel), Quick Menu, Community */}
            <section className="mb-4">
                <HeroSection />

                {/* Visual Offset: Lift QuickMenu up built-in to the component now */}
                <QuickMenu />

                <div className="mt-8 px-4 xl:px-0">
                    <CommunityNotice />
                </div>
            </section>

            <div className="w-full h-px bg-slate-100 my-12 max-w-7xl mx-auto" />

            {/* 2. Ad Sections (Now Unified) */}
            <UnifiedAdGrid
                shops={shops}
                onAdRegister={handleAdRegister}
                onSelectShop={(shop) => requireVerification(() => setSelectedShop(shop))}
            />

            {/* 추가광고 섹션 — additional_ad_status='active' 공고만 노출 */}
            {(() => {
                const additionalAds = (shops as any[]).filter(s => s.additional_ad_status === 'active');
                if (additionalAds.length === 0) return null;
                return (
                    <>
                        <div className="w-full h-px bg-slate-100 my-10 max-w-7xl mx-auto" />
                        <section className="max-w-7xl mx-auto px-4 xl:px-0 mb-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-full">추가광고</span>
                                <h2 className="text-sm font-black text-gray-700">최신 추가 구인정보</h2>
                                <span className="text-xs text-gray-400 font-bold">{additionalAds.length}건</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                                {additionalAds.map((shop: any) => (
                                    <div
                                        key={shop.id}
                                        onClick={() => requireVerification(() => setSelectedShop(shop))}
                                        className="bg-white border border-blue-100 rounded-2xl p-3 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
                                    >
                                        <div className="text-[10px] font-black text-blue-500 mb-1 truncate">{shop.region || ''}</div>
                                        <div className="text-xs font-black text-gray-900 truncate">{shop.title || shop.name || '제목 없음'}</div>
                                        <div className="text-[10px] text-gray-400 font-bold mt-0.5 truncate">{shop.pay || ''}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                );
            })()}

            <div className="w-full h-px bg-slate-100 my-16 max-w-7xl mx-auto" />

            {/* 3. Job List (Table/Cards) */}
            <JobListView
                shops={shops}
                brand={brand}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                setSelectedShop={(shop) => requireVerification(() => setSelectedShop(shop))}
                visibleCount={visibleCount}
                setVisibleCount={setVisibleCount}
                onAdRegister={handleAdRegister}
                onNativeAdRegister={handleAdRegister}
            />

            {/* Floating Conversion Widgets */}
            <FloatingConversion />

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
                    onToggleFavorite={(e: React.MouseEvent) => toggleFavorite(e, selectedShop.id)}
                />
            )}
        </div>
    );
}


