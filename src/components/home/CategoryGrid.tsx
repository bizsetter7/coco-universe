import React from 'react';
import { Building2, MapPin, Search, Coffee, Users, Siren, Scale, Megaphone, Bell } from 'lucide-react';
import { useBrand } from '../BrandProvider';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
    { icon: Building2, label: '업종별채용', color: 'text-indigo-500', bg: 'bg-indigo-50', link: '/jobs' },
    { icon: MapPin, label: '지역별 채용', color: 'text-blue-500', bg: 'bg-blue-50', link: '/region' },
    { icon: Search, label: '같이일할단짝', color: 'text-orange-500', bg: 'bg-orange-50', link: '/talent' }, /* Checked: /talent exists */
    { icon: Coffee, label: '프리미엄\n라운지', color: 'text-purple-500', bg: 'bg-purple-50', link: '/community?category=프리미엄 라운지' }, /* Matched QuickMenu */
    { icon: Users, label: '같이일할단짝', color: 'text-pink-500', bg: 'bg-pink-50', link: '/community?category=같이일할단짝' }, /* Matched QuickMenu */
    { icon: Siren, label: '밤문화 톡', color: 'text-red-500', bg: 'bg-red-50', link: '/community?category=밤 문화 Talk' }, /* Matched QuickMenu */
    { icon: Scale, label: '무료법률상담', color: 'text-slate-600', bg: 'bg-slate-50', link: '/community?category=무료법률상담' }, /* Updated Text */
    { icon: Megaphone, label: '광고문의', color: 'text-orange-500', bg: 'bg-orange-50', link: '/customer-center?tab=ad' },
];

export const CategoryGrid = () => {
    const brand = useBrand();
    const router = useRouter();

    return (
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4 mb-8 min-h-[100px]">
            {CATEGORIES.map((cat, idx) => (
                <div
                    key={idx}
                    onClick={() => router.push(cat.link)}
                    className={`
                        aspect-square rounded-2xl flex flex-col items-center justify-center text-center p-2 cursor-pointer
                        hover:scale-105 active:scale-95 transition-all shadow-sm hover:shadow-md
                        ${brand.theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
                        border ${brand.theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}
                    `}
                >
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full mb-2 flex items-center justify-center ${brand.theme === 'dark' ? 'bg-gray-700' : cat.bg}`}>
                        <cat.icon size={20} className={brand.theme === 'dark' ? 'text-gray-300' : cat.color} />
                    </div>
                    <span className={`text-[11px] md:text-xs font-bold whitespace-pre-line leading-tight ${brand.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {cat.label}
                    </span>
                </div>
            ))}
        </div>
    );
};
