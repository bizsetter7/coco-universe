'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBrand } from '@/components/BrandProvider';


export const HeroSection = () => {
    const router = useRouter();
    const [bannerIndex, setBannerIndex] = useState(0);

    const BANNERS = [
        {
            id: 1,
            title: "사장님! 3개월 광고 무료",
            subtitle: "지금 가입하면 유료 상품 300만원 상당이 0원!",
            bg: "bg-gray-900",
            buttonText: "무료로 광고 올리기",
            onClick: () => router.push('/?page=payment')
        },
        {
            id: 2,
            title: "대한민국 No.1 통합 구인구직",
            subtitle: "전국 어디서나 코코알바 하나면 끝",
            bg: "bg-gradient-to-r from-blue-900 to-slate-900",
            buttonText: "지역별 채용 보기",
            onClick: () => router.push('/?page=region')
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setBannerIndex(prev => (prev + 1) % 2); // BANNERS.length is 2
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const currentBanner = BANNERS[bannerIndex];



    return (
        <div className="relative w-full h-[260px] md:h-[320px] overflow-hidden bg-gray-900 text-white shadow-md">
            {/* Background Image / Gradient */}
            <div className={`absolute inset-0 ${currentBanner.bg} transition-colors duration-1000`}></div>
            <div className="absolute inset-0 bg-black/40 z-0"></div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
                <div className="bg-gradient-to-r from-pink-600 to-red-600 text-white text-[10px] md:text-xs font-black px-3 py-1 rounded-full mb-3 md:mb-5 animate-bounce shadow-xl border border-white/20">
                    🔥 GRAND OPEN: 역대급 혜택
                </div>
                <h1 className="text-[26px] md:text-5xl font-black mb-3 md:mb-6 tracking-tighter drop-shadow-2xl text-center leading-[1.1]">
                    사장님! <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 drop-shadow-none">3개월 광고 무료</span> 지원
                </h1>
                <div className="flex flex-col items-center gap-1 mb-6 md:mb-10 text-center">
                    <p className="text-[13px] md:text-xl text-gray-100 font-bold drop-shadow-md break-keep">
                        지금 가입하면 유료 상품 <span className="text-white bg-white/20 px-2 py-0.5 rounded-lg border border-white/20">300만원 상당</span> 구성이
                    </p>
                    <p className="text-lg md:text-2xl font-black text-amber-400 drop-shadow-md">조건 없이 0원! 즉시 노출 혜택!</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/my-shop?view=form&new=true')}
                        className="group relative bg-white text-black font-black py-3 px-8 md:py-4 md:px-12 rounded-2xl shadow-[0_8px_30px_rgb(255,255,255,0.4)] hover:shadow-[0_12px_40px_rgb(255,255,255,0.6)] hover:-translate-y-1 active:translate-y-0.5 transition-all text-sm md:text-lg overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        무료로 광고 올리기 🚀
                    </button>
                </div>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-6 w-full flex justify-center gap-2 z-20">
                {BANNERS.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setBannerIndex(idx)}
                        className={`transition-all duration-300 rounded-full h-1.5 ${bannerIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                    />
                ))}
            </div>
        </div>
    );
};
