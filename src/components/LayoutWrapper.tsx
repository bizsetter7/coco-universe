'use client';

import React, { useEffect, useState } from 'react';
import { useBrand } from './BrandProvider';
import { BannerSidebar } from './BannerSidebar';
import { MobileBottomNav } from './ui/MobileBottomNav';

interface LayoutWrapperProps {
    children: React.ReactNode;
}

export const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
    const brand = useBrand();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 특정 탭(공지사항 등)에서 본문이 넓어야 하는 경우를 위한 로직 (필요 시 확장)
    const isWidePage = false;

    return (
        <div className={`min-h-[100dvh] flex flex-col ${mounted && brand.theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`} style={{ isolation: 'isolate' }}>
            <div
                className="grid xl:grid-cols-[160px_1fr_160px] gap-0 xl:gap-8 w-full max-w-[1440px] mx-auto justify-center relative min-h-[100dvh] items-stretch"
                style={{
                    overflow: 'visible',
                    position: 'relative',
                    paddingTop: '56px'
                }}
            >

                {/* 왼쪽 사이드바 컨테이너 (Engine Track) */}
                <aside className="hidden xl:block w-[160px] h-full self-stretch relative" style={{ contain: 'none !important' }}>
                    <BannerSidebar side="left" />
                </aside>

                {/* 중앙 메인 */}
                <main className={`w-full ${isWidePage ? 'max-w-[1280px]' : 'max-w-[1020px]'} flex-1 min-w-0 shadow-none xl:shadow-none min-h-full main-content-area ${mounted && brand.theme === 'dark' ? 'text-white' : 'text-gray-950'}`}>
                    {children}
                </main>

                {/* 오른쪽 사이드바 컨테이너 (Engine Track) */}
                <aside className="hidden xl:block w-[160px] h-full self-stretch relative" style={{ contain: 'none !important' }}>
                    <BannerSidebar side="right" />
                </aside>

            </div>
            <MobileBottomNav />
        </div>
    );
};
