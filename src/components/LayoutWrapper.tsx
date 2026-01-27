'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { BannerSidebar } from './BannerSidebar';
import { useBrand } from './BrandProvider';

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isMyShop = pathname?.startsWith('/my-shop');

    const brand = useBrand();

    return (
        <div className={`min-h-screen w-full flex justify-center overflow-x-hidden ${brand.theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
            <div className="flex gap-0 xl:gap-6 w-full max-w-[1400px] justify-center px-0 xl:px-4 relative">

                {/* 왼쪽 사이드바 컨테이너 (Engine Track) */}
                <aside className="hidden xl:block w-[160px] relative self-stretch">
                    <BannerSidebar side="left" />
                </aside>

                {/* 중앙 메인 */}
                <main className={`w-full max-w-[1020px] flex-1 min-w-0 shadow-none xl:shadow-none min-h-screen ${brand.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
                    {children}
                </main>

                {/* 오른쪽 사이드바 컨테이너 (Engine Track) */}
                <aside className="hidden xl:block w-[160px] relative self-stretch">
                    <BannerSidebar side="right" />
                </aside>

            </div>
        </div>
    );
};
