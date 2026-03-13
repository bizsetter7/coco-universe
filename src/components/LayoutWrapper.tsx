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
// import { AdultVerificationGate } from './common/AdultVerificationGate'; // [GATE_LOCKED] 런칭 전까지 비활성
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
    const { isLoading } = useAuth();

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

    // ── [2] 성인인증 게이트 원천 봉쇄 ───────────────────────────────────────────
    // ⚠️  컴포넌트 호출부 자체를 비활성화 — 환경변수 설정 실수조차 허용하지 않음
    // ⚠️  AdultVerificationGate 임포트도 주석 처리됨 (위 import 라인 참조)
    //
    // 런칭 시 해제 순서:
    //   1) 위 import 주석 해제
    //   2) 아래 [GATE_LOCKED] 블록 주석 해제
    //   3) 재배포
    //
    // ── [GATE_LOCKED: 아래 블록을 런칭 전까지 절대 해제 금지] ──────────────────
    /*
    const [isVerified, setIsVerified] = React.useState<boolean | null>(null);
    React.useEffect(() => {
        if (isLoading) return;
        if (authUser?.isAdultVerified) { setIsVerified(true); return; }
        setIsVerified(localStorage.getItem('adult_verified') === 'true');
    }, [isLoading]);
    const handleVerify = () => {
        localStorage.setItem('adult_verified', 'true');
        setIsVerified(true);
    };
    if (isLoading || isVerified === null) return <LoadingSpinner />;
    if (!isVerified) return <AdultVerificationGate onVerify={handleVerify} />;
    */
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
