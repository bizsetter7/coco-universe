'use client';

import React, { useState, useEffect } from 'react';
import { useBrand } from '../BrandProvider';
import { Shop } from '@/types/shop';
import { ShopCard } from '../shop/ShopCard';
import { Search, ChevronDown, Check } from 'lucide-react';
import { JOB_CATEGORY_MAP, JOB_CATEGORIES } from '@/constants/jobs';
import { REGIONS_MAP, REGION_LIST } from '@/constants/regions';

export const RegionMainContent = ({ shops }: { shops: Shop[] }) => {
    const brand = useBrand();
    const isDark = brand.theme === 'dark';

    // Dropdown States
    const [selectedJobMain, setSelectedJobMain] = useState('');
    const [selectedJobSub, setSelectedJobSub] = useState('');
    const [selectedRegionMain, setSelectedRegionMain] = useState('');
    const [selectedRegionSub, setSelectedRegionSub] = useState('');

    // Reset Sub-categories when Main changes
    useEffect(() => {
        setSelectedJobSub('');
    }, [selectedJobMain]);

    useEffect(() => {
        setSelectedRegionSub('');
    }, [selectedRegionMain]);

    // Mock Data Partition
    const grandShops = shops.filter(s => s.tier === 'grand');
    const premiumShops = shops.filter(s => s.tier === 'premium' || s.is_premium);

    return (
        <div className="flex-1 min-w-0 pl-0 md:pl-6">
            {/* 1. Page Title & Tabs */}
            <div className="mb-6">
                <h1 className={`text-2xl font-black mb-4 border-l-4 pl-3 ${isDark ? 'text-white border-blue-500' : 'text-gray-900 border-rose-500'}`}>
                    업종별 채용
                </h1>

                <div className="flex text-sm font-bold border-b border-gray-200 dark:border-gray-700">
                    <button className="flex-1 py-3 text-white bg-blue-500 rounded-t-lg">업종별 채용</button>
                    <button className={`flex-1 py-3 ${isDark ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-gray-50'}`}>지역별 채용</button>
                    <button className={`flex-1 py-3 ${isDark ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-gray-50'}`}>오늘본공고</button>
                </div>
            </div>

            {/* 2. Notice Box */}
            <div className={`flex items-center gap-3 p-3 rounded-lg mb-6 text-sm ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded">공지사항</span>
                <span className={`flex-1 truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    [안내] 프리미엄 광고 "Grand Tier" 서비스 개편 및 혜택 안내
                </span>
                <ChevronDown size={14} className="text-gray-400" />
            </div>

            {/* 3. Search Bar */}
            <div className={`p-4 rounded-2xl mb-8 flex flex-wrap gap-2 items-center shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>

                {/* Job Category Main */}
                <div className="relative">
                    <select
                        value={selectedJobMain}
                        onChange={(e) => setSelectedJobMain(e.target.value)}
                        className={`appearance-none pl-4 pr-8 py-2 rounded-lg text-sm font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                    >
                        <option value="">업종선택</option>
                        {JOB_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>

                {/* Job Category Sub */}
                <div className="relative">
                    <select
                        value={selectedJobSub}
                        onChange={(e) => setSelectedJobSub(e.target.value)}
                        disabled={!selectedJobMain}
                        className={`appearance-none pl-4 pr-8 py-2 rounded-lg text-sm font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                    >
                        <option value="">상세업종</option>
                        {selectedJobMain && JOB_CATEGORY_MAP[selectedJobMain]?.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>

                {/* Region Main */}
                <div className="relative">
                    <select
                        value={selectedRegionMain}
                        onChange={(e) => setSelectedRegionMain(e.target.value)}
                        className={`appearance-none pl-4 pr-8 py-2 rounded-lg text-sm font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                    >
                        <option value="">지역선택</option>
                        {REGION_LIST.map(reg => (
                            <option key={reg} value={reg}>{reg}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>

                {/* Region Sub */}
                <div className="relative">
                    <select
                        value={selectedRegionSub}
                        onChange={(e) => setSelectedRegionSub(e.target.value)}
                        disabled={!selectedRegionMain}
                        className={`appearance-none pl-4 pr-8 py-2 rounded-lg text-sm font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                    >
                        <option value="">세부지역</option>
                        {selectedRegionMain && REGIONS_MAP[selectedRegionMain]?.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>

                <div className={`flex-1 min-w-[150px] px-4 py-2 rounded-lg border flex items-center gap-2 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <input type="text" placeholder="키워드 검색" className="bg-transparent w-full text-sm focus:outline-none" />
                </div>
                <button className="px-6 py-2 bg-blue-500 text-white font-black rounded-lg hover:bg-blue-600 shadow-md flex items-center gap-2">
                    <Search size={16} /> 검색
                </button>
            </div>

            {/* 4. Grand Open */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <Crown className="text-amber-500" fill="currentColor" size={20} />
                        그랜드 오픈 / VIP 채용
                    </h2>
                    <button className="px-2 py-1 rounded text-xs font-bold bg-blue-500 text-white hover:bg-blue-600">
                        광고신청
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {grandShops.map((shop, idx) => (
                        <ShopCard key={idx} shop={shop} rank={idx + 1} tierId="grand" />
                    ))}
                </div>
            </section>

            {/* 5. Premium List */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <Star className="text-purple-500" fill="currentColor" size={20} />
                        프리미엄 채용정보
                    </h2>
                    <button className="px-2 py-1 rounded text-xs font-bold bg-blue-500 text-white hover:bg-blue-600">
                        광고신청
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {premiumShops.map((shop, idx) => (
                        <ShopCard key={idx} shop={shop} rank={idx + 1} />
                    ))}
                </div>
            </section>
        </div>
    );
};

import { Crown, Star } from 'lucide-react';
