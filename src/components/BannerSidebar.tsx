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
    const [mounted, setMounted] = React.useState(false);
    const banners = side === 'left' ? LEFT_BANNERS : RIGHT_BANNERS;

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <aside
            className={`hidden 2xl:flex flex-col gap-3 fixed top-24 ${side === 'left' ? 'left-4' : 'right-4'} w-[130px] z-40 animate-in fade-in slide-in-from-${side === 'left' ? 'left' : 'right'} duration-700`}
        >
            <div className={`p-2 rounded-t-xl text-center text-[10px] font-black text-white ${side === 'left' ? 'bg-indigo-600' : 'bg-pink-600'}`}>
                {side === 'left' ? 'BEST AD' : 'PREMIUM'}
            </div>
            <div className="flex flex-col gap-2 p-1 bg-white/50 backdrop-blur-md rounded-b-xl border border-gray-100 shadow-xl overflow-hidden">
                {banners.map((banner) => (
                    <div
                        key={banner.id}
                        className="relative w-full aspect-[1/2] rounded-lg overflow-hidden border border-gray-100 hover:border-pink-500 transition-all cursor-pointer group"
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
            <div className="mt-2 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-gray-200 text-center shadow-lg group hover:bg-pink-50 transition-colors cursor-pointer">
                <p className="text-[10px] font-black text-gray-400 mb-1 group-hover:text-pink-500">배너 광고 문의</p>
                <p className="text-sm font-black text-gray-800">1544-5568</p>
            </div>
        </aside>
    );
};
