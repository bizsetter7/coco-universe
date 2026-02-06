'use client';

import React from 'react';
import { useBrand } from './BrandProvider';
import { InternalSidebar } from './region/InternalSidebar';

interface ListingPageLayoutProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
}

export const ListingPageLayout = ({ children, sidebar }: ListingPageLayoutProps) => {
    const brand = useBrand();
    const isDark = brand.theme === 'dark';

    const SidebarContent = sidebar || <InternalSidebar />;

    // Mobile: px-0, pt-0
    // Desktop: pt-4
    return (
        <div className={`w-full h-auto pb-20 pt-0 lg:pt-4 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
            <div className="max-w-[1432px] mx-auto px-0 md:px-0 flex flex-col lg:flex-row gap-4 relative">

                {/* 1. Internal Sidebar */}
                {/* Mobile: Static Top Block */}
                {/* Reduced margin bottom to pull content up */}
                <div className="lg:hidden w-full mb-0">
                    {SidebarContent}
                </div>

                {/* Desktop: Sticky Left Block */}
                <aside className="hidden lg:block w-[220px] flex-shrink-0 relative">
                    <div className="sticky top-[70px]">
                        {SidebarContent}
                    </div>
                </aside>

                {/* 2. Main Content */}
                <div className="flex-1 min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
};
