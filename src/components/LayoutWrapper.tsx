'use client';

import React from 'react';

import { BannerSidebar } from './BannerSidebar';
import { useMobile } from '@/hooks/useMobile';
import { MobileBottomNav } from './ui/MobileBottomNav';
import { useBrand } from './BrandProvider';
import { Footer } from './layout/Footer';
import { LAYOUT } from '@/constants/layout';
import MainHeader from './common/MainHeader';
import { Shop } from '@/types/shop';
import { AdultVerificationGate } from './common/AdultVerificationGate';
import { usePathname } from 'next/navigation';

interface LayoutWrapperProps {
    children: React.ReactNode;
    sideAds: Shop[]; // [Optimization]
}

export const LayoutWrapper = ({ children, sideAds }: LayoutWrapperProps) => {
    const isMobile = useMobile();
    const brand = useBrand();
    const pathname = usePathname();
    const [isVerified, setIsVerified] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        const verified = localStorage.getItem('adult_verified') === 'true';
        const session = localStorage.getItem('user_session');
        setIsVerified(verified || !!session);
    }, []);

    const handleVerify = () => {
        localStorage.setItem('adult_verified', 'true');
        setIsVerified(true);
    };

    if (isVerified === null) return null; // Prevent flicker

    if (!isVerified) {
        return <AdultVerificationGate onVerify={handleVerify} />;
    }

    return (
        <React.Fragment>
            {/* Global Header */}
            <MainHeader />

            {/* 
               [Golden Rule - Framework Reconstruction] 
               1. Outer Wrapper: Max 1432px, Centered, Relative
               2. Sidebars: Absolute positioned at top-[10px] (Overlapping Header)
               3. Main Grid: Keeps 160px spacers to prevent content overlap
            */}
            <div className={`w-full max-w-[1432px] mx-auto relative h-auto`}>

                {/* Left Sidebar - Absolute Overlay (Desktop Only) */}
                {!isMobile && (
                    <div className="hidden xl:block absolute top-0 left-0 w-[160px] h-full z-[10002] pointer-events-none">
                        <div className="sticky top-[66px] pointer-events-auto">
                            <BannerSidebar side="left" shops={sideAds} />
                        </div>
                    </div>
                )}

                {/* Right Sidebar - Absolute Overlay (Desktop Only) */}
                {!isMobile && (
                    <div className="hidden xl:block absolute top-0 right-0 w-[160px] h-full z-[10002] pointer-events-none">
                        <div className="sticky top-[66px] pointer-events-auto">
                            <BannerSidebar side="right" shops={sideAds} />
                        </div>
                    </div>
                )}

                {/* Main Grid - Spacers + Content */}
                <div className="grid grid-cols-1 xl:grid-cols-[160px_1fr_160px] xl:gap-4">
                    {/* Left Spacer */}
                    <div className="hidden xl:block w-[160px]" />

                    {/* Main Content */}
                    <main className={`w-full flex-1 min-w-0 relative`}>
                        {children}
                    </main>

                    {/* Right Spacer */}
                    <div className="hidden xl:block w-[160px]" />
                </div>

            </div>

            {/* Global Footer */}
            <Footer />

            <MobileBottomNav />
        </React.Fragment>
    );
};
