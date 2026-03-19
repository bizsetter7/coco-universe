'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';

interface ExposureItemProps {
    rank: string;
    desc: string;
    onArrowClick?: () => void;
}

export const ExposureItem = ({ rank, desc, onArrowClick }: ExposureItemProps) => {
    const brand = useBrand();

    const getTheme = (rank: string) => {
        const isDark = brand.theme === 'dark';
        switch (rank) {
            case 'GRAND': return {
                badge: 'bg-amber-500 text-white shadow-amber-200',
                box: isDark ? 'bg-amber-900/10 border-amber-900/30' : 'bg-amber-50 border-amber-100',
                text: isDark ? 'text-amber-200' : 'text-amber-900'
            };
            case 'PREMIUM': return {
                badge: 'bg-purple-600 text-white shadow-purple-200',
                box: isDark ? 'bg-purple-900/10 border-purple-900/30' : 'bg-purple-50 border-purple-100',
                text: isDark ? 'text-purple-200' : 'text-purple-900'
            };
            case 'DELUXE': return {
                badge: 'bg-[#f82b60] text-white shadow-rose-200',
                box: isDark ? 'bg-[#f82b60]/10 border-[#f82b60]/30' : 'bg-rose-50 border-rose-100',
                text: isDark ? 'text-rose-200' : 'text-rose-900'
            };
            case 'SPECIAL': return {
                badge: 'bg-[#f82b60] text-white shadow-rose-200',
                box: isDark ? 'bg-[#f82b60]/10 border-[#f82b60]/30' : 'bg-rose-50 border-rose-100',
                text: isDark ? 'text-rose-200' : 'text-rose-900'
            };
            case 'NATIVE': return {
                badge: 'bg-emerald-600 text-white shadow-emerald-200',
                box: isDark ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100',
                text: isDark ? 'text-emerald-200' : 'text-emerald-900'
            };
            default: return {
                badge: 'bg-gray-600 text-white shadow-gray-200',
                box: isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-100',
                text: isDark ? 'text-gray-300' : 'text-gray-900'
            };
        }
    };

    const theme = getTheme(rank);

    return (
        <div
            onClick={() => onArrowClick && onArrowClick()}
            className={`px-3 py-2 md:px-5 md:py-2.5 border-b lg:border-b last:border-b-0 ${theme.box} transition-all duration-300 hover:brightness-95 group min-h-[65px] flex items-center justify-center lg:justify-start lg:min-h-[55px] cursor-pointer`}
        >
            <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4 w-full text-center lg:text-left">
                <div className="shrink-0 w-full lg:w-[80px] flex justify-center">
                    <span className={`inline-block px-2 py-0.5 lg:px-2.5 lg:py-1 ${theme.badge} text-[8px] lg:text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm group-hover:scale-105 lg:group-hover:scale-110 transition-transform w-auto lg:w-full text-center`}>
                        {rank}
                    </span>
                </div>
                <div className="flex-1">
                    <p className={`text-[10px] md:text-[11px] lg:text-[11px] font-bold lg:font-medium leading-tight break-keep ${theme.text}`}>
                        {desc}
                    </p>
                </div>
                <div className="hidden lg:block">
                    <ArrowRight size={16} className={`transition-transform group-hover:translate-x-1 ${theme.text} opacity-50 group-hover:opacity-100`} />
                </div>
            </div>
        </div>
    );
};
