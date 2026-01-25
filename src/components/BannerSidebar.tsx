'use client';

import React from 'react';

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
    const [mounted, setMounted] = React.useState(false);
    const banners = side === 'left' ? LEFT_BANNERS : RIGHT_BANNERS;

    React.useEffect(() => {
        setMounted(true);
        if (typeof window === 'undefined') return;

        const updatePosition = () => {
            if (!asideRef.current) return;

            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;
            const sidebarHeight = asideRef.current.offsetHeight;
            const docHeight = document.documentElement.scrollHeight;

            // Default target: Scroll Position + Header Offset (16px)
            let targetTop = scrollY + 16;

            // Smart Bottom-Align Logic (for small screens/tall banners)
            // If banner is taller than viewport, we stick it such that the bottom is visible
            const isTall = sidebarHeight + 16 > viewportHeight;
            if (isTall) {
                // Calculate the point where the sidebar bottom touches the viewport bottom
                // Target = Scroll + Viewport - SidebarHeight - BottomGap
                targetTop = scrollY + viewportHeight - sidebarHeight - 40;

                // But don't go ABOVE the original start point (16px absolute) if we are at the top
                if (targetTop < 16) targetTop = 16;
            }

            // Boundary check: Don't push past the bottom of the document
            const maxTop = docHeight - sidebarHeight - 40;
            targetTop = Math.min(targetTop, maxTop);

            asideRef.current.style.top = `${targetTop}px`;
        };

        const resizeObserver = new ResizeObserver(() => {
            updatePosition();
        });

        if (asideRef.current) {
            resizeObserver.observe(asideRef.current);
        }

        window.addEventListener('scroll', updatePosition, { passive: true });
        window.addEventListener('resize', updatePosition);

        // Initial update
        updatePosition();

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, []);

    if (!mounted) return null;

    return (
        <aside
            ref={asideRef}
            className={`hidden 2xl:flex flex-col absolute z-40 animate-in fade-in duration-700 w-[120px] shrink-0`}
            style={{
                top: '16px', // Initial static position
                [side]: `calc(50% - 510px - 130px)`, // Restore horizontal position
                transition: 'top 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' // The "Elastic Chase" effect
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
