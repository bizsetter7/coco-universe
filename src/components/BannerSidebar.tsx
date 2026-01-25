'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

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
    const [mounted, setMounted] = React.useState(false);
    const banners = side === 'left' ? LEFT_BANNERS : RIGHT_BANNERS;

    const isSnapMode = React.useRef(false);
    const lastDocHeight = React.useRef(0);

    // Helper to toggle transition class
    const setSnapClass = (active: boolean) => {
        if (!asideRef.current) return;
        if (active) {
            asideRef.current.classList.add('no-transition');
        } else {
            asideRef.current.classList.remove('no-transition');
        }
    };

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // We use useLayoutEffect to update position BEFORE paint to prevent ghosting
    React.useLayoutEffect(() => {
        if (typeof window === 'undefined') return;

        lastDocHeight.current = document.documentElement.scrollHeight;

        // Set initial transition style in JS to avoid React overwrite, but allow class override
        if (asideRef.current) {
            asideRef.current.style.transition = 'top 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        }

        const updatePosition = (options: { immediate?: boolean } = {}) => {
            if (!asideRef.current) return;

            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;
            const sidebarHeight = asideRef.current.offsetHeight;

            let targetTop = scrollY + 16;

            const isTall = sidebarHeight + 16 > viewportHeight;
            if (isTall) {
                targetTop = scrollY + viewportHeight - sidebarHeight - 40;
                if (targetTop < 16) targetTop = 16;
            }

            const currentTop = parseFloat(asideRef.current.style.top || '16');

            // Forced Snap Check: Snap Mode OR Huge Distance (>100px)
            if (isSnapMode.current || Math.abs(targetTop - currentTop) > 100) {
                options.immediate = true;
            }

            if (options.immediate) {
                setSnapClass(true); // Disable transition via !important class
                asideRef.current.style.top = `${targetTop}px`;
                void asideRef.current.offsetHeight; // Force Reflow

                // Keep snap mode on for a bit if it was a layout change
                if (!isSnapMode.current) {
                    setTimeout(() => {
                        setSnapClass(false);
                    }, 100);
                }
            } else {
                setSnapClass(false);
                asideRef.current.style.top = `${targetTop}px`;
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            const newHeight = document.documentElement.scrollHeight;
            const delta = Math.abs(newHeight - lastDocHeight.current);
            lastDocHeight.current = newHeight;

            if (delta > 200) {
                isSnapMode.current = true;
                setTimeout(() => {
                    isSnapMode.current = false;
                    setSnapClass(false);
                }, 500);
            }
            updatePosition({ immediate: true });
        });

        if (document.body) {
            resizeObserver.observe(document.body);
        }

        window.addEventListener('scroll', () => updatePosition({ immediate: false }), { passive: true });
        window.addEventListener('resize', () => updatePosition({ immediate: true }));

        // Initial update
        updatePosition({ immediate: true });

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('scroll', () => updatePosition({ immediate: false }));
            window.removeEventListener('resize', () => updatePosition({ immediate: true }));
        };
    }, []);

    // Navigation Snap
    React.useLayoutEffect(() => {
        if (!asideRef.current) return;

        // 1. Immediately kill transition and reset top
        setSnapClass(true);
        asideRef.current.style.top = '16px';
        void asideRef.current.offsetHeight; // Force Paint

        // 2. Enable strict snap mode for 300ms to catch any browser scroll restoration lag
        isSnapMode.current = true;

        const timer = setTimeout(() => {
            isSnapMode.current = false;
            setSnapClass(false); // Re-enable elastic feel
        }, 300);

        return () => clearTimeout(timer);
    }, [pathname]);

    if (!mounted) return null;

    return (
        <aside
            ref={asideRef}
            className={`hidden 2xl:flex flex-col absolute z-40 animate-in fade-in duration-700 w-[120px] shrink-0`}
            style={{
                top: '16px',
                [side]: `calc(50% - 510px - 130px)`,
                // Transition handled via JS/Class
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
