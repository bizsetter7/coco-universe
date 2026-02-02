'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, MessageSquare, User, Sparkles, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const MobileBottomNav = () => {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(true);

    const navItems = [
        { label: '홈', icon: <Home size={24} />, href: '/' },
        { label: '커뮤니티', icon: <MessageSquare size={24} />, href: '/community' },
        { label: '광고등록', icon: <Plus size={32} className="text-white" />, href: '/ad-register', isMain: true },
        { label: '라운지', icon: <Sparkles size={24} />, href: '/lounge' },
        { label: 'MY', icon: <User size={24} />, href: '/my-shop' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden flex flex-col items-center pointer-events-none">
            {/* Toggle Handle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="pointer-events-auto bg-white dark:bg-gray-800 border border-b-0 border-gray-200 dark:border-gray-700 rounded-t-xl px-4 py-1.5 shadow-md -mb-1 z-10 flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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
                    w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-xl pb-safe transition-all duration-300 ease-in-out pointer-events-auto
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
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 mt-1">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1 py-1 ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
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
                <div className="h-[env(safe-area-inset-bottom)] bg-white dark:bg-gray-900" />
            </div>
        </div>
    );
};
