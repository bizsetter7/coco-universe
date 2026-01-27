'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { BannerSidebar } from './BannerSidebar';

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const isMyShop = pathname?.startsWith('/my-shop');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex justify-center">
            <div className="flex gap-6 w-full max-w-[1400px] justify-center px-4 relative">

                {/* 왼쪽 사이드바 컨테이너 (Engine Track) */}
                <aside className="hidden xl:block w-[160px] relative self-stretch">
                    <BannerSidebar side="left" />
                </aside>

                {/* 중앙 메인 */}
                <main className={`w-full max-w-[1020px] flex-1 min-w-0 bg-white dark:bg-gray-900 shadow-sm xl:shadow-none min-h-screen`}>
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
