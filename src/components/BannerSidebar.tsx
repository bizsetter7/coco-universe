'use client';

import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface Banner {
    id: string;
    imageUrl: string;
    link: string;
    alt: string;
}

const LEFT_BANNERS: Banner[] = [
    { id: 'l1', imageUrl: '/side_banner_sample_1.png', link: '#', alt: '강남 유앤미' },
    { id: 'l2', imageUrl: '/side_banner_sample_2.png', link: '#', alt: '송파 루비' },
    { id: 'l3', imageUrl: '/side_banner_sample_3.png', link: '#', alt: '인천 스카이' },
];

const RIGHT_BANNERS: Banner[] = [
    { id: 'r1', imageUrl: '/side_banner_sample_3.png', link: '#', alt: '인천 스카이' },
    { id: 'r2', imageUrl: '/side_banner_sample_1.png', link: '#', alt: '강남 유앤미' },
    { id: 'r3', imageUrl: '/side_banner_sample_2.png', link: '#', alt: '송파 루비' },
];

export const BannerSidebar = ({ side }: { side: 'left' | 'right' }) => {
    const asideRef = React.useRef<HTMLElement>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // UNIQUE KEY: Forces complete unmount/remount on any URL/Param change.
    // This is the "Nuclear Option" against state persistence bugs.
    const uniqueKey = `${pathname}?${searchParams.toString()}-${side}`;

    const [mounted, setMounted] = React.useState(false);
    const banners = side === 'left' ? LEFT_BANNERS : RIGHT_BANNERS;

    const isInitialLoad = React.useRef(true);
    const animationFrameRef = React.useRef<number>(0);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useLayoutEffect(() => {
        if (typeof window === 'undefined' || !asideRef.current) return;

        // 1. INITIAL INSTANT PLACEMENT (Frame 0)
        // We calculate position immediately without waiting for an animation frame.
        // This prevents the user from seeing the sidebar at top:0 if we are scrolled down.
        const setInitialPosition = () => {
            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;
            const sidebarHeight = asideRef.current!.offsetHeight;

            // Measure MAIN (True Content Height)
            const mainEl = document.querySelector('main');
            const contentHeight = mainEl ? mainEl.offsetHeight : document.documentElement.scrollHeight;

            // The Maximum allowed top (Stick to bottom of content)
            const maxSafeTop = Math.max(16, contentHeight - sidebarHeight);

            // Ideal Top (Chase Mode)
            let targetTop = scrollY + 16;

            // Bottom-Align Logic for small screens
            if (sidebarHeight + 16 > viewportHeight) {
                targetTop = scrollY + viewportHeight - sidebarHeight - 40;
                if (targetTop < 16) targetTop = 16;
            }

            // INSTANT CLAMP: If the new page/tab is shorter than current scroll + sidebar,
            // clamp strict immediately.
            if (targetTop > maxSafeTop) {
                targetTop = maxSafeTop;
            }

            // Apply Instantly
            asideRef.current!.style.transition = 'none';
            asideRef.current!.style.top = `${targetTop}px`;

            // Force Reflow
            void asideRef.current!.offsetHeight;

            // Enable Transition for subsequent moves after a small delay
            // This delay mask any initial layout trashing
            setTimeout(() => {
                if (asideRef.current) {
                    asideRef.current.style.transition = 'top 0.4s cubic-bezier(0.1, 0.9, 0.2, 1)';
                    isInitialLoad.current = false;
                }
            }, 300);
        };

        setInitialPosition();

        // 2. SCROLL LOOP (Elastic Chase)
        // Using requestAnimationFrame for silky smooth updates instead of scroll listener
        const updatePosition = () => {
            if (!asideRef.current) return;

            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;
            const sidebarHeight = asideRef.current.offsetHeight;

            const mainEl = document.querySelector('main');
            const contentHeight = mainEl ? mainEl.offsetHeight : document.documentElement.scrollHeight;
            const maxSafeTop = Math.max(16, contentHeight - sidebarHeight);

            let targetTop = scrollY + 16;

            if (sidebarHeight + 16 > viewportHeight) {
                targetTop = scrollY + viewportHeight - sidebarHeight - 40;
                if (targetTop < 16) targetTop = 16;
            }

            // ALWAYS CLAMP
            // This is the fix for "Stuck at Bottom".
            // Even if scrolling wildly, checking this every frame ensures
            // we never float below the footer.
            if (targetTop > maxSafeTop) {
                targetTop = maxSafeTop;
            }

            asideRef.current.style.top = `${targetTop}px`;

            animationFrameRef.current = requestAnimationFrame(updatePosition);
        };

        // Start Loop
        animationFrameRef.current = requestAnimationFrame(updatePosition);

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    if (!mounted) return null;

    return (
        <aside
            ref={asideRef}
            key={uniqueKey}
            className={`hidden 2xl:flex flex-col absolute z-40 animate-in fade-in duration-500 w-[120px] shrink-0`}
            style={{
                top: '16px',
                [side]: `calc(50% - 510px - 130px)`,
                // Initial Transition None to prevent jump
                transition: 'none'
            }}
        >
            <div className={`py-2 rounded-t-xl text-center text-[9px] font-black text-white ${side === 'left' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-pink-600 shadow-pink-100'} shadow-lg`}>
                {side === 'left' ? 'BEST AD' : 'PREMIUM'}
            </div>

            <div className="bg-white/50 backdrop-blur-md rounded-b-xl border border-gray-100 shadow-xl overflow-hidden p-1.5">
                <div className="flex flex-col gap-2">
                    {banners.map((banner) => (
                        <div
                            key={banner.id}
                            className="relative w-full aspect-[3/5] rounded-lg overflow-hidden border border-gray-100 hover:border-pink-500 transition-all cursor-pointer group"
                        >
                            <img
                                src={banner.imageUrl}
                                alt={banner.alt}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[9px] text-white font-bold bg-black/60 px-2 py-1 rounded-full backdrop-blur-sm">상세보기</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-3 bg-gradient-to-br from-white to-gray-50 p-2.5 rounded-xl border border-gray-100 text-center shadow-inner group hover:bg-pink-50 transition-colors cursor-pointer">
                    <p className="text-[10px] font-black text-gray-400 mb-0.5 group-hover:text-pink-500">배너 광고 문의</p>
                    <p className="text-sm font-black text-gray-800 tabular-nums">1544-5568</p>
                </div>
            </div>
        </aside>
    );
};
