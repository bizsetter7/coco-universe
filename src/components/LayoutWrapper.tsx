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
import { AUDIT_MODE, ADULT_GATE_DISABLED } from '@/lib/brand-config';

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

    // ── [2] 성인인증 게이트 마스터 락 ───────────────────────────────────────────
    // ADULT_GATE_DISABLED 기본값 = true (환경변수 미설정 포함)
    // → AdultVerificationGate가 렌더링 파이프라인에 절대 진입 불가
    // → isVerified 대기도 불필요 — auth 로딩만 완료되면 즉시 정상 렌더링
    if (ADULT_GATE_DISABLED) {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            );
        }
        // 게이트 완전 패스 → 정상 레이아웃으로 바로 진행
    } else {
        // ── [3] 게이트 활성 모드 (NEXT_PUBLIC_ADULT_GATE_DISABLED=false 명시 설정 시) ──
        if (isLoading || isVerified === null) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            );
        }
        if (!isVerified) {
            return <AdultVerificationGate onVerify={handleVerify} />;
        }
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
