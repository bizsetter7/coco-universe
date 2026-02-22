'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Rocket, HelpCircle } from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';


export const HeroSection = () => {
    const router = useRouter();

    // Simplified static banner info for diet
    const bannerInfo = {
        title: "사장님! 1개월 광고 무료",
        subtitle: "지금 가입하면 기본 광고 1개월 무료 지원!",
        bg: "bg-gray-900"
    };



    return (
        <div className="relative w-full h-[360px] md:h-[340px] overflow-hidden bg-slate-950 text-white shadow-2xl">
            {/* Background Layer with Animated Gradient Mesh */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${bannerInfo.bg} opacity-80`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(219,39,119,0.1),transparent_70%)] animate-pulse" />
            </div>

            {/* Glassmorphism Grain Overlay */}
            <div className="absolute inset-0 bg-slate-950/20 backdrop-brightness-75 z-0" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-10 pointer-events-none" />

            {/* Main Content Box - Stable Responsive Layout */}
            <div className="relative z-10 h-full max-w-3xl mx-auto flex flex-col items-center justify-center px-6 text-center">
                <div className="flex flex-col items-center -mt-4 md:-mt-6">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-pink-600/10 backdrop-blur-xl px-4 py-1.5 rounded-full border border-pink-500/30 mb-3 md:mb-4 animate-in slide-in-from-top-4 duration-700">
                        <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-ping" />
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-pink-400">Grand Infrastructure Live</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-[28px] md:text-[52px] font-black mb-2 md:mb-4 tracking-tighter leading-[1.3] md:leading-[1.1] filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                        <>사장님!<br className="md:hidden" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500">1개월 광고 무료</span> 지원</>
                    </h1>

                    {/* Subtitle */}
                    <div className="flex flex-col items-center mb-5 md:mb-7">
                        <p className="text-base md:text-xl font-bold text-slate-200 mb-2 tracking-tight drop-shadow-md">
                            {bannerInfo.subtitle}
                        </p>
                        <div className="w-12 md:w-20 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-50" />
                        <span className="text-[8px] md:text-[9px] font-black text-slate-400 mt-2 tracking-[0.3em] uppercase select-none">
                            Coco Alba Premium System
                        </span>
                    </div>

                    {/* Buttons */}
                    {/* Buttons - Raised slightly on PC as requested */}
                    <div className="flex flex-col sm:flex-row gap-2.5 items-center md:-mt-2 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
                        <Link
                            href="/ad-apply"
                            className="group relative inline-flex items-center justify-center px-8 py-2.5 md:px-10 md:py-3.5 rounded-xl md:rounded-2xl bg-white text-slate-900 font-bold text-xs md:text-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden whitespace-nowrap"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-50 to-rose-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <span className="relative z-10">무료로 광고 올리기 🚀</span>
                        </Link>
                        <Link
                            href="/guide"
                            className="group inline-flex items-center justify-center px-8 py-2.5 md:px-10 md:py-3.5 rounded-xl md:rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/20 text-white font-bold text-xs md:text-sm hover:bg-slate-900/60 transition-all duration-300 whitespace-nowrap"
                        >
                            서비스 가이드 보기
                        </Link>
                    </div>
                </div>
            </div>

            {/* Side Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-600/10 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 blur-[100px] rounded-full -ml-40 -mb-40 pointer-events-none" />
        </div>
    );
};

