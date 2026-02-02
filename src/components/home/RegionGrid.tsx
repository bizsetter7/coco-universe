'use client';

import React from 'react';
import { useBrand } from '@/components/BrandProvider';
import { MapPin } from 'lucide-react';

interface RegionGridProps {
    onRegionSelect: (region: string) => void;
}

export const RegionGrid = ({ onRegionSelect }: RegionGridProps) => {
    const brand = useBrand();

    const REGIONS = [
        '서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종',
        '강원', '충남', '충북', '전남', '전북', '경남', '경북', '제주'
    ];

    return (
        <div className="w-full bg-white dark:bg-gray-900 py-10 border-b dark:border-gray-800">
            <div className="max-w-[1020px] mx-auto px-4">
                <div className="flex items-center gap-2 mb-6">
                    <MapPin className="text-pink-500" size={24} />
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">지역별 채용정보</h2>
                </div>

                <div className="grid grid-cols-4 md:grid-cols-9 gap-3">
                    {REGIONS.map((region) => (
                        <button
                            key={region}
                            onClick={() => onRegionSelect(region)}
                            className="bg-gray-50 dark:bg-gray-800 hover:bg-pink-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 hover:border-pink-200 rounded-xl py-3 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-pink-600 transition-all shadow-sm"
                        >
                            {region}
                        </button>
                    ))}
                    <button
                        onClick={() => onRegionSelect('전체')}
                        className="col-span-1 md:col-span-1 bg-gray-900 text-white rounded-xl py-3 text-sm font-bold hover:bg-black transition-all shadow-md"
                    >
                        전국
                    </button>
                </div>
            </div>
        </div>
    );
};
