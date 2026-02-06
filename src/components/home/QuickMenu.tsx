'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, MapPin, User, Moon, Users, Siren, Scale, Megaphone, Gift, Home, Sparkles, MessageCircle, Headphones, Crown, Search, Coffee } from 'lucide-react';
import { useBrand } from '@/components/BrandProvider';

export const QuickMenu = () => {
    const router = useRouter();
    const brand = useBrand();

    // Corrected Links & Order based on User Request
    // 1. 업종별채용, 2. 지역별채용, 3. 인재정보, 4. 프리미엄라운지
    // 5. 같이일할단짝, 6. 밤문화 톡, 7. 무료법률상담, 8. 광고문의
    const MENU_ITEMS = [
        { icon: Briefcase, label: '업종별채용', bg: 'bg-indigo-50', color: 'text-indigo-600', link: '/jobs' },
        { icon: MapPin, label: '지역별채용', bg: 'bg-blue-50', color: 'text-blue-600', link: '/region' },
        { icon: Search, label: '인재정보', bg: 'bg-teal-50', color: 'text-teal-600', link: '/talent' },
        { icon: Crown, label: '프리미엄\n라운지', bg: 'bg-purple-50', color: 'text-purple-600', link: '/community?category=프리미엄 라운지' },
        { icon: Users, label: '같이일할단짝', bg: 'bg-pink-50', color: 'text-pink-600', link: '/community?category=같이일할단짝' },
        { icon: Siren, label: '밤문화 톡', bg: 'bg-red-50', color: 'text-red-600', link: '/community?category=밤 문화 Talk' },
        { icon: Scale, label: '무료\n법률상담', bg: 'bg-slate-50', color: 'text-slate-600', link: '/community?category=무료법률상담' },
        { icon: Megaphone, label: '광고문의', bg: 'bg-orange-50', color: 'text-orange-600', link: '/customer-center?tab=ad' },
    ];

    return (
        <div className="w-full bg-white py-4 md:py-6 border-b border-gray-100">
            <div className="max-w-[1020px] mx-auto px-4">
                {/* Quick Icon Grid - Perfect 4x2 Alignment */}
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4 justify-items-center">
                    {MENU_ITEMS.map((item, i) => (
                        <div
                            key={i}
                            onClick={() => router.push(item.link)}
                            className="w-full aspect-[1/1] overflow-hidden flex flex-col items-center justify-center p-2 rounded-2xl cursor-pointer hover:scale-105 transition-transform border bg-white border-stone-100 shadow-sm"
                        >
                            <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full mb-1 flex items-center justify-center ${item.bg} ${item.color}`}>
                                <item.icon size={18} className="sm:w-6 sm:h-6" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-center leading-snug text-gray-950">
                                {item.label.split('\n').map((line, idx) => (
                                    <React.Fragment key={idx}>
                                        {line}
                                        {idx < item.label.split('\n').length - 1 && <br />}
                                    </React.Fragment>
                                ))}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
