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

    // Helper to manage transition
    const setTransition = (enable: boolean) => {
        if (!asideRef.current) return;
        asideRef.current.style.transition = enable ? 'top 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none';
    };

    React.useEffect(() => {
        setMounted(true);
        if (typeof window === 'undefined') return;

        // Set initial transition programmatically to avoid React conflicts
        if (asideRef.current) {
            asideRef.current.style.transition = 'top 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        }

        const updatePosition = (options: { immediate?: boolean } = {}) => {
            if (!asideRef.current) return;

            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;
            const sidebarHeight = asideRef.current.offsetHeight;
            const docHeight = document.documentElement.scrollHeight;

            // Default target: Scroll Position + Header Offset (16px)
            let targetTop = scrollY + 16;

            // Smart Bottom-Align Logic
            const isTall = sidebarHeight + 16 > viewportHeight;
            if (isTall) {
                targetTop = scrollY + viewportHeight - sidebarHeight - 40;
                if (targetTop < 16) targetTop = 16;
            }

            // Boundary check removed to maintain "Chase" effect at the very bottom
            // const maxTop = docHeight - sidebarHeight - 40; 
            // targetTop = Math.min(targetTop, maxTop);

            // Distance Check: Lower threshold to 150px to catch smaller layout shifts
            const currentTop = parseFloat(asideRef.current.style.top || '16');
            if (Math.abs(targetTop - currentTop) > 150) {
                options.immediate = true;
            }

            if (options.immediate) {
                setTransition(false); // Force None
                asideRef.current.style.top = `${targetTop}px`;
                void asideRef.current.offsetHeight; // Force Reflow

                // Restore separately to avoid race conditions
                setTimeout(() => {
                    setTransition(true);
                }, 100);
            } else {
                // Ensure transition is ON for normal movement
                // We access the ref directly to avoid React state/prop interference
                if (asideRef.current.style.transition === 'none') {
                    setTransition(true);
                }
                asideRef.current.style.top = `${targetTop}px`;
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            // If body resizes, it might be a layout change. Update immediately to prevent ghost sliding.
            updatePosition({ immediate: true });
        });

        // Observe the body for layout changes (e.g., content loading, images resizing)
        if (document.body) {
            resizeObserver.observe(document.body);
        }

        window.addEventListener('scroll', () => updatePosition({ immediate: false }), { passive: true });
        window.addEventListener('resize', () => updatePosition({ immediate: true })); // Window resize should be immediate snap

        // Initial update
        updatePosition({ immediate: true });

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('scroll', () => updatePosition({ immediate: false })); // Fix cleanup signature
            window.removeEventListener('resize', () => updatePosition({ immediate: true }));
        };
    }, []);

    // Effect to handle Pathname Changes (Navigation)
    React.useEffect(() => {
        // Reset to top immediately on page change
        if (!asideRef.current) return;
        setTransition(false);
        // We use 16px as the baseline for new pages
        asideRef.current.style.top = '16px';

        // Allow layout to settle then re-enable
        const timer = setTimeout(() => {
            setTransition(true);
        }, 100);
        return () => clearTimeout(timer);
    }, [pathname]);

    if (!mounted) return null;

    return (
        <aside
            ref={asideRef}
            className={`hidden 2xl:flex flex-col absolute z-40 animate-in fade-in duration-700 w-[120px] shrink-0`}
            style={{
                top: '16px', // Initial static position
                [side]: `calc(50% - 510px - 130px)`, // Restore horizontal position
                // Transition REMOVED from here to prevent React hydration/update overrides.
                // It is fully managed by the JS side-effect above.
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
