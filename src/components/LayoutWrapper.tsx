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
import { useIdleLogout } from '@/hooks/useIdleLogout';
import { IdleLogoutModal } from './auth/IdleLogoutModal';
import { AUDIT_MODE, ADULT_GATE_DISABLED } from '@/lib/brand-config';
import { isWorkTypeSlug } from '@/lib/data/work-type-guide';
import OpenEventPopup from './OpenEventPopup';

interface LayoutWrapperProps {
    children: React.ReactNode;
    sideAds: Shop[]; // [Optimization]
}

export const LayoutWrapper = ({ children, sideAds }: LayoutWrapperProps) => {
    const isMobile = useMobile();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user: authUser, isLoading, isLoggedIn, logout } = useAuth();

    // ── [Idle Logout Setup] ───────────────────────────────────────────────────
    const { showWarning, secondsLeft, keepAlive } = useIdleLogout({
        enabled: isLoggedIn && (authUser?.type === 'corporate' || authUser?.type === 'individual'),
        onLogout: logout,
    });

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

        // 관리자 계정은 모든 게이트 자동 통과
        if (authUser && authUser.type === 'admin') {
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

    const handleSkip = () => {
        sessionStorage.setItem('adult_gate_skipped', 'true');
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

    // /auth/ 하위 경로 (비밀번호 재설정 등) — 성인인증 게이트 없이 접근 가능해야 함
    const isAuthFlowPage = pathname?.startsWith('/auth/');

    // 가이드 페이지 여부 확인 (예: /coco/서울/룸알바)
    // 실서버(Vercel) 및 브라우저 환경에 따라 다르게 들어올 수 있는 pathname을 정규화
    const decodedPath = (pathname ? decodeURIComponent(pathname) : '').normalize('NFC');
    const pathParts = decodedPath.split('/');
    const isGuidePage = pathParts.length === 4 && pathParts[1] === 'coco' && isWorkTypeSlug(pathParts[3]);

    // 미인증 상태이고 게이트가 활성화된 경우 게이트 노출 (단, 공개 페이지·인증플로우·가이드페이지 제외)
    // [Soft Gate Strategy] — SEO를 위해 children을 DOM에 남겨두고 오버레이만 씌움
    const showAdultGate = !isVerified && !ADULT_GATE_DISABLED && !isAdminPage && !isAuthFlowPage && !isPublicPage && !isGuidePage;
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
            {/* [Soft Gate Overlay] — 미인증 시에만 노출 */}
            {showAdultGate && (
                <div className="fixed inset-0 z-[20000] bg-white/40 backdrop-blur-xl flex items-center justify-center p-4">
                    <AdultVerificationGate onVerify={handleVerify} onSkip={handleSkip} />
                </div>
            )}

            <div className={`flex flex-col min-h-screen ${showAdultGate ? 'blur-2xl pointer-events-none select-none max-h-screen overflow-hidden' : ''}`}>
                {/* Global Header — 어드민 페이지는 자체 레이아웃이 있으므로 제외 */}
                {!isAdminPage && <MainHeader />}

                {/*
                   [Golden Rule - Framework Reconstruction v2]
                   1. Outer Wrapper: Max 1432px, Centered, Relative
                   2. Main Grid: 160px Spacers + 1fr Content
                   3. Sidebars: Now nested INSIDE spacers to contribute to height and ensure alignment
                */}
                <div className={`w-full max-w-[1432px] mx-auto relative h-auto flex-1`}>

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

                        {/* Right Sidebar - [Optimization] PC Only, UI_Z_INDEX.SIDEBAR (10001) 표준 적용 */}
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
            </div>

            <Suspense fallback={null}>
                <MobileBottomNav />
            </Suspense>

            <IdleLogoutModal
                isOpen={showWarning}
                secondsLeft={secondsLeft}
                onKeepAlive={keepAlive}
                onLogout={logout}
            />

            {/* 오픈 상생지원 이벤트 팝업 (어드민/인증게이트 제외) */}
            {!isAdminPage && !showAdultGate && <OpenEventPopup />}
        </React.Fragment>
    );
};
