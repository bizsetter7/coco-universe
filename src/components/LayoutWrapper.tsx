'use client';

import React, { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

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
import { AUDIT_MODE, ADULT_GATE_DISABLED } from '@/lib/brand-config';

interface LayoutWrapperProps {
    children: React.ReactNode;
    sideAds: Shop[]; // [Optimization]
}

export const LayoutWrapper = ({ children, sideAds }: LayoutWrapperProps) => {
    const isMobile = useMobile();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user: authUser, isLoading } = useAuth();

    const isAdminPage = pathname?.startsWith('/admin');

    // ── [1] Audit Mode: P4 심사용 B2B 랜딩 강제 노출 ────────────────────────────
    if (AUDIT_MODE && !isAdminPage) {
        return (
            <div className="w-full min-h-screen bg-white">
                <Suspense fallback={null}>
                    <AuditLanding />
                </Suspense>
            </div>
        );
    }

    // ── [2] 성인인증 게이트 (Adult Verification Gate) ──────────────────────────────
    const [isVerified, setIsVerified] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        if (isLoading) return;

        // 게이트가 비활성화(DISABLED=true) 되어있으면 즉시 통과
        if (ADULT_GATE_DISABLED) {
            setIsVerified(true);
            return;
        }

        // 로그인된 유저가 인증된 파트너이거나, 로컬 스토리지에 기록이 있으면 통과
        if (authUser && authUser.id !== 'guest' && authUser.isVerifiedPartnerVerified) {
            setIsVerified(true);
            return;
        }

        const localVerified = localStorage.getItem('adult_verified') === 'true';
        const sessionSkipped = sessionStorage.getItem('adult_gate_skipped') === 'true';
        setIsVerified(localVerified || sessionSkipped);
    }, [isLoading, authUser, pathname]);

    const handleVerify = () => {
        localStorage.setItem('adult_verified', 'true');
        setIsVerified(true);
    };

    if (isLoading || isVerified === null) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // ── [Public Page Check] ───────────────────────────────────────────────────
    const currentQueryPage = searchParams?.get('page');
    const isPublicPage = ['signup', 'find-id', 'find-pw', 'support', 'faq', 'inquiry'].includes(currentQueryPage || '');
    // 로그인 전 인증 관련 페이지 — 사이드 배너 미노출
    const isAuthPage = ['login', 'signup', 'find-id', 'find-pw', 'guest'].includes(currentQueryPage || '');

    // 미인증 상태이고 게이트가 활성화된 경우 게이트 노출 (단, 공개 페이지는 제외)
    if (!isVerified && !ADULT_GATE_DISABLED && !isAdminPage && !isPublicPage) {
        return <AdultVerificationGate onVerify={handleVerify} />;
    }
    // ── [/GATE_LOCKED] ─────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
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

                <div className={(isMobile || isAdminPage || isAuthPage) ? "block min-h-screen" : "grid grid-cols-1 xl:grid-cols-[160px_1fr_160px] xl:gap-8 xl:px-0 min-h-full items-stretch"}>
                    {/* Left Sidebar Spacer + Component - [Optimization] PC Only, 인증 페이지 제외 */}
                    {(!isMobile && !isAdminPage && !isAuthPage) && (
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

                    {/* Right Sidebar Spacer + Component - [Optimization] PC Only, 인증 페이지 제외 */}
                    {(!isMobile && !isAdminPage && !isAuthPage) && (
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
