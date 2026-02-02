'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, MessageSquare, User, Sparkles, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useBrand } from '../BrandProvider';

export const MobileBottomNav = () => {
    const pathname = usePathname();
    const brand = useBrand();
    const [isExpanded, setIsExpanded] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = [
        { label: '홈', icon: <Home size={24} />, href: '/' },
        { label: '커뮤니티', icon: <MessageSquare size={24} />, href: '/community' },
        { label: '광고등록', icon: <Plus size={32} className="text-white" />, href: '/ad-register', isMain: true },
        { label: '라운지', icon: <Sparkles size={24} />, href: '/lounge' },
        { label: 'MY', icon: <User size={24} />, href: '/my-shop' },
    ];

    const isDark = brand.theme === 'dark';

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden flex flex-col items-center pointer-events-none bottom-nav">
            {/* Toggle Handle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`pointer-events-auto border border-b-0 rounded-t-xl px-4 py-1.5 shadow-md -mb-1 z-10 flex items-center gap-1.5 text-xs font-bold transition-colors ${mounted && isDark
                    ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200'
                    : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600'
                    }`}
            >
                {isExpanded ? (
                    <>
                        <span>숨기기</span>
                        <ChevronDown size={14} />
                    </>
                ) : (
                    <>
                        <span>네비게이션 열기</span>
                        <ChevronUp size={14} />
                    </>
                )}
            </button>

            {/* Nav Content */}
            <div
                className={`
                    w-full border-t shadow-xl pb-safe transition-all duration-300 ease-in-out pointer-events-auto
                    ${mounted && isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'}
                    ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
                `}
            >
                <div className="grid grid-cols-5 h-16 items-center px-2">
                    {navItems.map((item, index) => {
                        const isActive = item.href === '/'
                            ? pathname === '/'
                            : pathname?.startsWith(item.href);

                        if (item.isMain) {
                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className="relative -top-5 flex flex-col items-center justify-center"
                                >
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-500/30 flex items-center justify-center hover:scale-105 transition-transform">
                                        {item.icon}
                                    </div>
                                    <span className={`text-[10px] font-bold mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1 py-1 ${isActive ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-gray-500' : 'text-gray-400')}`}
                            >
                                <div className={isActive ? 'text-pink-500' : ''}>
                                    {item.icon}
                                </div>
                                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
                {/* Safe Area Spacer for iPhone X+ */}
                <div className={`h-[env(safe-area-inset-bottom)] ${isDark ? 'bg-gray-950' : 'bg-white'}`} />
            </div>
        </div>
    );
};
