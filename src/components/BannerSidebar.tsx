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
            className={`hidden 2xl:flex flex-col fixed top-[115px] z-40 animate-in fade-in duration-700 w-[120px] shadow-sm`}
            style={{
                [side]: `calc(50% - 510px - 130px)`,
                // 510px is half of 1020px stage, 130px is sidebar width(120) + 10px gap
            }}
        >
            <div className={`py-1.5 rounded-t-xl text-center text-[9px] font-black text-white ${side === 'left' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-pink-600 shadow-pink-100'} shadow-lg`}>
                {side === 'left' ? 'BEST AD' : 'PREMIUM'}
            </div>

            <div className="bg-white/50 backdrop-blur-md rounded-b-xl border border-gray-100 shadow-xl overflow-hidden p-1">
                <div className="flex flex-col gap-1.5">
                    {banners.map((banner) => (
                        <div
                            key={banner.id}
                            className="relative w-full aspect-[1.1/1] rounded-lg overflow-hidden border border-gray-50 hover:border-pink-500 transition-all cursor-pointer group"
                        >
                            <img
                                src={banner.imageUrl}
                                alt={banner.alt}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[8px] text-white font-bold bg-black/60 px-1.5 py-0.5 rounded-full backdrop-blur-sm">보기</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-2 bg-gradient-to-br from-white to-gray-50 p-2 rounded-xl border border-gray-100 text-center shadow-inner group hover:bg-pink-50 transition-colors cursor-pointer">
                    <p className="text-[9px] font-black text-gray-400 mb-0.5 group-hover:text-pink-500">광고 문의</p>
                    <p className="text-xs font-black text-gray-800 tabular-nums">1544-5568</p>
                </div>
            </div>
        </aside>
    );
};
