'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';

import { BannerSidebar } from './BannerSidebar';
import { StickyWrapper } from './ui/StickyWrapper';
import { useMobile } from '@/hooks/useMobile';
import { MobileBottomNav } from './ui/MobileBottomNav';
import { useBrand } from './BrandProvider';
import { Footer } from './layout/Footer';
import { LAYOUT } from '@/constants/layout';
import MainHeader from './common/MainHeader';
import { Shop } from '@/types/shop';
import { AdultVerificationGate } from './common/AdultVerificationGate';

interface LayoutWrapperProps {
    children: React.ReactNode;
    sideAds: Shop[]; // [Optimization]
}

export const LayoutWrapper = ({ children, sideAds }: LayoutWrapperProps) => {
    const isMobile = useMobile();
    const brand = useBrand();
    const [isVerified, setIsVerified] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        // Move all client-side checks here to ensure hydration matches
        const verified = localStorage.getItem('adult_verified') === 'true';
        const session = localStorage.getItem('user_session');
        setIsVerified(verified || !!session);
    }, []); // Run once on mount

    const handleVerify = () => {
        localStorage.setItem('adult_verified', 'true');
        setIsVerified(true);
    };

    const showGate = isVerified === false;

    if (showGate) {
        return <AdultVerificationGate onVerify={handleVerify} />;
    }

    return (
        <React.Fragment>
            {/* Global Header */}
            <MainHeader />

            {/* 
               [Golden Rule - Framework Reconstruction v2] 
               1. Outer Wrapper: Max 1432px, Centered, Relative
               2. Main Grid: 160px Spacers + 1fr Content
               3. Sidebars: Now nested INSIDE spacers to contribute to height and ensure alignment
            */}
            <div className={`w-full max-w-[1432px] mx-auto relative h-auto`}>

                <div className={isMobile ? "block min-h-full" : "grid grid-cols-1 xl:grid-cols-[160px_1fr_160px] xl:gap-4 xl:px-0 min-h-full"}>
                    {/* Left Sidebar Spacer + Component */}
                    {!isMobile && (
                        <aside className="hidden xl:block w-[160px] relative h-auto min-h-full z-[50]">
                            <StickyWrapper offsetTop={56}>
                                <BannerSidebar side="left" shops={sideAds} />
                            </StickyWrapper>
                        </aside>
                    )}

                    {/* Main Content */}
                    <main className={`w-full flex-1 min-w-0 relative z-[10]`}>
                        {children}
                    </main>

                    {/* Right Sidebar Spacer + Component */}
                    {!isMobile && (
                        <aside className="hidden xl:block w-[160px] relative h-auto min-h-full z-[50]">
                            <StickyWrapper offsetTop={56}>
                                <BannerSidebar side="right" shops={sideAds} />
                            </StickyWrapper>
                        </aside>
                    )}
                </div>

            </div>

            {/* Global Footer */}
            <Footer />

            <Suspense fallback={null}>
                <MobileBottomNav />
            </Suspense>
        </React.Fragment>
    );
};
