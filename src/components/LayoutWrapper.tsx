'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BannerSidebar } from './BannerSidebar';
import { useBrand } from './BrandProvider';
import { MobileBottomNav } from './ui/MobileBottomNav';

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isMyShop = pathname?.startsWith('/my-shop');

    const isJobsPage = pathname?.startsWith('/jobs');
    const isRegionPage = pathname?.startsWith('/region');
    const isCommunityPage = pathname?.startsWith('/community');
    const isCustomerPage = pathname?.startsWith('/customer-center');
    const isHomePage = pathname === '/';
    const isWidePage = isJobsPage || isRegionPage || isHomePage || isCommunityPage || isCustomerPage;

    const brand = useBrand();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className={`min-h-[100dvh] w-full flex justify-center overflow-visible ${mounted && brand.theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`} style={{ overflow: 'visible' }}>
            <div
                className={`grid xl:grid-cols-[160px_1fr_160px] gap-0 xl:gap-8 w-full ${isWidePage ? 'max-w-[1700px] justify-center px-0 xl:px-4' : 'max-w-[1400px] justify-center px-0 xl:px-4'} relative min-h-[100dvh] items-stretch`}
                style={{
                    overflow: 'visible',
                }}
            >

                {/* 왼쪽 사이드바 컨테이너 (Engine Track) */}
                <aside className="hidden xl:block w-[160px] h-full self-stretch relative">
                    <BannerSidebar side="left" />
                </aside>

                {/* 중앙 메인 */}
                <main className={`w-full ${isWidePage ? 'max-w-[1280px]' : 'max-w-[1020px]'} flex-1 min-w-0 shadow-none xl:shadow-none min-h-full main-content-area ${mounted && brand.theme === 'dark' ? 'text-white' : 'text-gray-950'}`}>
                    {children}
                </main>

                {/* 오른쪽 사이드바 컨테이너 (Engine Track) */}
                <aside className="hidden xl:block w-[160px] h-full self-stretch relative">
                    <BannerSidebar side="right" />
                </aside>

            </div>
            <MobileBottomNav />
        </div>
    );
};
