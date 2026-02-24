'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';

import { BannerSidebar } from './BannerSidebar';
import { StickyWrapper } from './ui/StickyWrapper';
import { useMobile } from '@/hooks/useMobile';
import { MobileBottomNav } from './ui/MobileBottomNav';
import { useBrand } from './BrandProvider';
import { Footer } from './layout/Footer';
import MainHeader from './common/MainHeader';
import { Shop } from '@/types/shop';
import { AdultVerificationGate } from './common/AdultVerificationGate';
import { AuditLanding } from './audit/AuditLanding';

import { useAuth } from '@/hooks/useAuth';
import { AUDIT_MODE } from '@/lib/brand-config';

interface LayoutWrapperProps {
    children: React.ReactNode;
    sideAds: Shop[]; // [Optimization]
}

export const LayoutWrapper = ({ children, sideAds }: LayoutWrapperProps) => {
    const isMobile = useMobile();
    const pathname = usePathname();
    const { user: authUser, isLoggedIn, isLoading } = useAuth();
    const [isVerified, setIsVerified] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        if (isLoading) return;

        // DB에서 인증된 회원인 경우
        if (isLoggedIn && authUser.isAdultVerified) {
            setIsVerified(true);
            return;
        }

        // 비로그인 또는 DB 미인증 시 로컬 스토리지 확인
        const localVerified = localStorage.getItem('adult_verified') === 'true';
        setIsVerified(localVerified);
    }, [isLoggedIn, authUser.isAdultVerified, isLoading]);

    const handleVerify = () => {
        localStorage.setItem('adult_verified', 'true');
        setIsVerified(true);
    };

    const isAdminPage = pathname?.startsWith('/admin');

    // [New] Audit Mode Handling - PG 심사 시 모든 경로에서 AuditLanding 강제 노출 (Admin 제외)
    if (AUDIT_MODE && !isAdminPage) {
        return (
            <div className="w-full min-h-screen bg-white">
                <Suspense fallback={null}>
                    <AuditLanding />
                </Suspense>
            </div>
        );
    }

    // 로딩 중에는 아무것도 보여주지 않거나 스플래시 노출
    // [Optimization] Prevent white screen flash by showing a minimal loader or Skeleton
    if (isLoading || isVerified === null) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const showGate = !isVerified;

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

                <div className={isMobile || isAdminPage ? "block min-h-screen" : "grid grid-cols-1 xl:grid-cols-[160px_1fr_160px] xl:gap-8 xl:px-0 min-h-full items-stretch"}>
                    {/* Left Sidebar Spacer + Component - [Optimization] PC Only */}
                    {(!isMobile && !isAdminPage) && (
                        <aside className="hidden xl:flex flex-col w-[160px] relative z-[10001] self-stretch">
                            <StickyWrapper offsetTop={56} zIndex={10001}>
                                <BannerSidebar side="left" shops={sideAds} />
                            </StickyWrapper>
                        </aside>
                    )}

                    {/* Main Content */}
                    <main className={`w-full flex-1 min-w-0 relative z-[10] ${isAdminPage ? 'px-0' : ''}`}>
                        {children}
                    </main>

                    {/* Right Sidebar Spacer + Component - [Optimization] PC Only */}
                    {(!isMobile && !isAdminPage) && (
                        <aside className="hidden xl:flex flex-col w-[160px] relative z-[10001] self-stretch">
                            <StickyWrapper offsetTop={56} zIndex={10001}>
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
