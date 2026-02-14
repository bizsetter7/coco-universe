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
                <div className="bg-red-600/90 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full mb-3 md:mb-4 animate-bounce shadow-lg border border-red-500/50">
                    GRAND OPEN
                </div>
                <h1 className="text-[22px] md:text-4xl font-black mb-2 md:mb-4 tracking-tight drop-shadow-xl text-center leading-tight">
                    사장님! <span className="text-amber-400">3개월 광고 무료</span> 이벤트
                </h1>
                <p className="text-sm md:text-lg text-gray-200 mb-5 md:mb-8 font-medium drop-shadow-md text-center max-w-[90%] break-keep">
                    지금 가입하면 유료 상품 <span className="font-bold text-white border-b border-white/40 pb-0.5">300만원 상당이 0원!</span>
                </p>
                <div className="flex gap-4">
                    <button className="bg-white text-black font-bold py-2 px-5 md:py-2.5 md:px-8 rounded-full shadow-[0_4px_14px_rgba(255,255,255,0.4)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.6)] hover:scale-105 active:scale-95 transition-all text-xs md:text-base">
                        무료로 광고 올리기
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
