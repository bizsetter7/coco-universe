'use client';

import React from 'react';
import Image from 'next/image';
import { Maximize2, Monitor, Smartphone } from 'lucide-react';

interface ExposureItemProps {
    title: string;
    pcSrc: string;
    mobileSrc: string;
    desc: string;
    brandTheme: string;
    onImageClick: (src: string) => void;
}

export const ExposureItem = ({ title, pcSrc, mobileSrc, desc, brandTheme, onImageClick }: ExposureItemProps) => {
    return (
        <div className={`p-6 md:p-10 rounded-[40px] border transition-all ${brandTheme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-xl shadow-gray-100/50'}`}>
            <h4 className={`text-xl font-black mb-6 flex items-center gap-3 ${brandTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <div className="w-1.5 h-6 bg-pink-600 rounded-full" />
                {title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* PC Preview */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <span className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest"><Monitor size={14} /> Desktop View</span>
                        <button onClick={() => onImageClick(pcSrc)} className="text-[10px] font-black text-pink-600 flex items-center gap-1 hover:underline"><Maximize2 size={12} /> 크게보기</button>
                    </div>
                    <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-slate-100 shadow-inner group cursor-pointer" onClick={() => onImageClick(pcSrc)}>
                        <Image src={pcSrc} alt={`${title} PC`} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="text-white" size={32} />
                        </div>
                    </div>
                </div>
                {/* Mobile Preview */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <span className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest"><Smartphone size={14} /> Mobile View</span>
                        <button onClick={() => onImageClick(mobileSrc)} className="text-[10px] font-black text-pink-600 flex items-center gap-1 hover:underline"><Maximize2 size={12} /> 크게보기</button>
                    </div>
                    <div className="relative aspect-[9/12] rounded-3xl overflow-hidden border-4 border-slate-100 shadow-inner max-w-[280px] mx-auto group cursor-pointer" onClick={() => onImageClick(mobileSrc)}>
                        <Image src={mobileSrc} alt={`${title} Mobile`} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="text-white" size={32} />
                        </div>
                    </div>
                </div>
            </div>
            <p className={`mt-8 text-sm md:text-base font-bold leading-relaxed whitespace-pre-line text-center ${brandTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {desc}
            </p>
        </div>
    );
};
