'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, MapPin, User, Moon, Users, Siren, Scale, Megaphone, Gift, Home } from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';

export const QuickMenu = () => {
    const router = useRouter();
    const brand = useBrand();

    // Data from stable_v1.backup.tsx
    const menuItems = [
        { label: '업종별채용', icon: Briefcase, bg: 'bg-indigo-100', color: 'text-indigo-600', link: '/jobs' },
        { label: '지역별 채용', icon: Home, bg: 'bg-blue-100', color: 'text-blue-600', link: '/region' },
        { label: '인재정보', icon: User, bg: 'bg-teal-100', color: 'text-teal-600', link: '/talent' },
        { label: '프리미엄 라운지', icon: Moon, bg: 'bg-indigo-100', color: 'text-indigo-600', link: '/community?category=프리미엄 라운지' },
        { label: '같이일할단짝', icon: Users, bg: 'bg-pink-100', color: 'text-pink-600', link: '/community?category=같이일할단짝' },
        { label: '밤문화 톡', icon: Siren, bg: 'bg-red-100', color: 'text-red-500', link: '/community?category=밤 문화 Talk' },
        { label: '무료법률자문', icon: Scale, bg: 'bg-gray-100', color: 'text-gray-600', link: '/community?category=무료법률상담' },
        { label: '광고문의', icon: Megaphone, bg: 'bg-slate-100', color: 'text-slate-600', link: '/customer-center?tab=ad' },
        { label: '공지 및 이벤트', icon: Gift, bg: 'bg-rose-100', color: 'text-rose-500', link: '/customer-center?tab=notice' },
    ];

    return (
        <div className="w-full bg-white dark:bg-gray-900 py-6 md:py-8 border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-[1020px] mx-auto px-4">
                {/* Quick Icon Grid - Perfect 9 alignment (Restored from stable_v1.backup.tsx) */}
                <div className="grid grid-cols-3 md:grid-cols-9 gap-3 md:gap-4 justify-items-center">
                    {menuItems.map((item, i) => (
                        <div
                            key={i}
                            onClick={() => router.push(item.link)}
                            className={`w-full flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-2xl cursor-pointer hover:scale-105 transition-transform border ${brand.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-stone-100 shadow-sm'}`}
                        >
                            <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full mb-1.5 sm:mb-2 flex items-center justify-center ${item.bg} ${item.color}`}>
                                <item.icon size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <span className={`text-[10px] sm:text-xs font-black text-center break-keep ${brand.theme === 'dark' ? 'text-gray-200' : 'text-gray-950'}`}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
